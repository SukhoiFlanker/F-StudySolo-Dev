import math
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.database import get_db

UTC = timezone.utc
REQUEST_PROVIDER_SENTINEL = "__all__"
MODEL_UNKNOWN_SENTINEL = "__unknown__"
_PRICING_CACHE_TTL = timedelta(minutes=5)


@dataclass(slots=True)
class BoundUsageRequest:
    request_id: str
    user_id: str
    source_type: str
    source_subtype: str
    workflow_id: str | None = None
    workflow_run_id: str | None = None
    conversation_id: str | None = None
    message_id: str | None = None


@dataclass(slots=True)
class BoundUsageCall:
    node_id: str | None = None
    node_type: str | None = None


@dataclass(slots=True)
class UsageNumbers:
    input_tokens: int = 0
    output_tokens: int = 0
    reasoning_tokens: int = 0
    cached_tokens: int = 0
    total_tokens: int = 0


@dataclass(slots=True)
class UsagePricing:
    input_price_per_million: float = 0.0
    output_price_per_million: float = 0.0


_request_context: ContextVar[BoundUsageRequest | None] = ContextVar(
    "usage_request_context",
    default=None,
)
_call_context: ContextVar[BoundUsageCall | None] = ContextVar(
    "usage_call_context",
    default=None,
)
_pricing_cache: dict[tuple[str, str], UsagePricing] = {}
_pricing_cache_expires_at: datetime | None = None


def utcnow() -> datetime:
    return datetime.now(UTC)


def normalize_provider(value: str | None) -> str:
    return (value or MODEL_UNKNOWN_SENTINEL).strip() or MODEL_UNKNOWN_SENTINEL


def normalize_model(value: str | None) -> str:
    return (value or MODEL_UNKNOWN_SENTINEL).strip() or MODEL_UNKNOWN_SENTINEL


def bucket_to_minute(dt: datetime) -> datetime:
    return dt.astimezone(UTC).replace(second=0, microsecond=0)


def estimate_token_count(text: str) -> int:
    normalized = text.strip()
    if not normalized:
        return 0
    return max(1, math.ceil(len(normalized) / 4))


def estimate_usage_from_messages(messages: list[dict[str, Any]], output_text: str) -> UsageNumbers:
    input_text = "\n".join(str(message.get("content", "")) for message in messages)
    input_tokens = estimate_token_count(input_text)
    output_tokens = estimate_token_count(output_text)
    return UsageNumbers(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens,
    )


def parse_openai_usage(usage: Any) -> UsageNumbers:
    if usage is None:
        return UsageNumbers()

    prompt_tokens = int(getattr(usage, "prompt_tokens", 0) or 0)
    completion_tokens = int(getattr(usage, "completion_tokens", 0) or 0)
    total_tokens = int(getattr(usage, "total_tokens", 0) or 0)
    prompt_details = getattr(usage, "prompt_tokens_details", None)
    completion_details = getattr(usage, "completion_tokens_details", None)
    cached_tokens = int(getattr(prompt_details, "cached_tokens", 0) or 0) if prompt_details else 0
    reasoning_tokens = (
        int(getattr(completion_details, "reasoning_tokens", 0) or 0)
        if completion_details
        else 0
    )

    if total_tokens <= 0:
        total_tokens = prompt_tokens + completion_tokens

    return UsageNumbers(
        input_tokens=prompt_tokens,
        output_tokens=completion_tokens,
        reasoning_tokens=reasoning_tokens,
        cached_tokens=cached_tokens,
        total_tokens=total_tokens,
    )


@contextmanager
def bind_usage_request(request: BoundUsageRequest):
    token = _request_context.set(request)
    try:
        yield request
    finally:
        _request_context.reset(token)


@contextmanager
def bind_usage_call(node_id: str | None = None, node_type: str | None = None):
    token = _call_context.set(BoundUsageCall(node_id=node_id, node_type=node_type))
    try:
        yield
    finally:
        _call_context.reset(token)


def get_bound_usage_request() -> BoundUsageRequest | None:
    return _request_context.get()


def get_bound_usage_call() -> BoundUsageCall | None:
    return _call_context.get()


async def create_usage_request(
    *,
    user_id: str,
    source_type: str,
    source_subtype: str,
    workflow_id: str | None = None,
    workflow_run_id: str | None = None,
    conversation_id: str | None = None,
    message_id: str | None = None,
) -> BoundUsageRequest:
    db = await get_db()
    started_at = utcnow()
    result = (
        await db.table("ss_ai_requests")
        .insert({
            "user_id": user_id,
            "source_type": source_type,
            "source_subtype": source_subtype,
            "workflow_id": workflow_id,
            "workflow_run_id": workflow_run_id,
            "conversation_id": conversation_id,
            "message_id": message_id,
            "status": "running",
            "started_at": started_at.isoformat(),
        })
        .execute()
    )
    row = (result.data or [{}])[0]
    request = BoundUsageRequest(
        request_id=str(row.get("id")),
        user_id=user_id,
        source_type=source_type,
        source_subtype=source_subtype,
        workflow_id=workflow_id,
        workflow_run_id=workflow_run_id,
        conversation_id=conversation_id,
        message_id=message_id,
    )
    await _increment_minute_rollup(
        minute_bucket=bucket_to_minute(started_at),
        user_id=user_id,
        source_type=source_type,
        source_subtype=source_subtype,
        logical_requests=1,
    )
    return request


async def finalize_usage_request(request_id: str, status: str) -> None:
    db = await get_db()
    await (
        db.table("ss_ai_requests")
        .update({
            "status": status,
            "finished_at": utcnow().isoformat(),
        })
        .eq("id", request_id)
        .execute()
    )


async def _get_pricing_map() -> dict[tuple[str, str], UsagePricing]:
    global _pricing_cache, _pricing_cache_expires_at
    now = utcnow()
    if _pricing_cache_expires_at and _pricing_cache_expires_at > now:
        return _pricing_cache

    db = await get_db()
    result = (
        await db.table("ai_models")
        .select(
            "id, provider, input_price, output_price, input_price_per_million, output_price_per_million"
        )
        .execute()
    )
    cache: dict[tuple[str, str], UsagePricing] = {}
    for row in result.data or []:
        provider = normalize_provider(row.get("provider"))
        model = normalize_model(row.get("id"))
        input_rate = float(row.get("input_price_per_million") or row.get("input_price") or 0.0)
        output_rate = float(row.get("output_price_per_million") or row.get("output_price") or 0.0)
        cache[(provider, model)] = UsagePricing(
            input_price_per_million=input_rate,
            output_price_per_million=output_rate,
        )
    _pricing_cache = cache
    _pricing_cache_expires_at = now + _PRICING_CACHE_TTL
    return _pricing_cache


async def calculate_cost_usd(
    *,
    provider: str,
    model: str,
    usage: UsageNumbers,
) -> float:
    pricing_map = await _get_pricing_map()
    pricing = pricing_map.get((normalize_provider(provider), normalize_model(model)))
    if pricing is None:
        return 0.0
    input_cost = usage.input_tokens * pricing.input_price_per_million / 1_000_000
    output_cost = usage.output_tokens * pricing.output_price_per_million / 1_000_000
    return round(input_cost + output_cost, 8)


async def record_usage_event(
    *,
    provider: str,
    model: str,
    status: str,
    usage: UsageNumbers,
    attempt_index: int,
    is_fallback: bool,
    started_at: datetime,
    finished_at: datetime,
    provider_request_id: str | None = None,
) -> None:
    request = get_bound_usage_request()
    if request is None:
        return

    call_context = get_bound_usage_call()
    db = await get_db()
    latency_ms = max(0, int((finished_at - started_at).total_seconds() * 1000))
    cost_amount_usd = await calculate_cost_usd(provider=provider, model=model, usage=usage)

    await (
        db.table("ss_ai_usage_events")
        .insert({
            "request_id": request.request_id,
            "user_id": request.user_id,
            "source_type": request.source_type,
            "source_subtype": request.source_subtype,
            "provider": normalize_provider(provider),
            "model": normalize_model(model),
            "node_id": call_context.node_id if call_context else None,
            "attempt_index": attempt_index,
            "is_fallback": is_fallback,
            "status": status,
            "latency_ms": latency_ms,
            "input_tokens": usage.input_tokens,
            "output_tokens": usage.output_tokens,
            "reasoning_tokens": usage.reasoning_tokens,
            "cached_tokens": usage.cached_tokens,
            "total_tokens": usage.total_tokens,
            "cost_amount_usd": cost_amount_usd,
            "provider_request_id": provider_request_id,
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
        })
        .execute()
    )

    await _increment_minute_rollup(
        minute_bucket=bucket_to_minute(started_at),
        user_id=request.user_id,
        source_type=request.source_type,
        source_subtype=request.source_subtype,
        provider=provider,
        model=model,
        provider_calls=1,
        successful_provider_calls=1 if status == "success" else 0,
        total_tokens=usage.total_tokens if status == "success" else 0,
        total_cost_usd=cost_amount_usd if status == "success" else 0.0,
        error_count=0 if status == "success" else 1,
        fallback_count=1 if is_fallback else 0,
        latency_ms_sum=latency_ms,
        latency_ms_count=1,
    )


async def _increment_minute_rollup(
    *,
    minute_bucket: datetime,
    user_id: str,
    source_type: str,
    source_subtype: str,
    provider: str = REQUEST_PROVIDER_SENTINEL,
    model: str = REQUEST_PROVIDER_SENTINEL,
    logical_requests: int = 0,
    provider_calls: int = 0,
    successful_provider_calls: int = 0,
    total_tokens: int = 0,
    total_cost_usd: float = 0.0,
    error_count: int = 0,
    fallback_count: int = 0,
    latency_ms_sum: int = 0,
    latency_ms_count: int = 0,
) -> None:
    db = await get_db()
    await db.rpc(
        "fn_ss_ai_usage_minute_increment",
        {
            "p_minute_bucket": minute_bucket.isoformat(),
            "p_user_id": user_id,
            "p_source_type": source_type,
            "p_source_subtype": source_subtype,
            "p_provider": normalize_provider(provider),
            "p_model": normalize_model(model),
            "p_logical_requests": logical_requests,
            "p_provider_calls": provider_calls,
            "p_successful_provider_calls": successful_provider_calls,
            "p_total_tokens": total_tokens,
            "p_total_cost_usd": total_cost_usd,
            "p_error_count": error_count,
            "p_fallback_count": fallback_count,
            "p_latency_ms_sum": latency_ms_sum,
            "p_latency_ms_count": latency_ms_count,
        },
    ).execute()
