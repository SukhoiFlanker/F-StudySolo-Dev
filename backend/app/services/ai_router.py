"""AI model router with fallback chains and usage instrumentation."""

import logging
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any

from openai import APIError, APITimeoutError, AsyncOpenAI

from app.core.config_loader import get_config
from app.services.usage_ledger import (
    UsageNumbers,
    estimate_usage_from_messages,
    parse_openai_usage,
    record_usage_event,
    utcnow,
)

logger = logging.getLogger(__name__)


class AIRouterError(Exception):
    """Raised when all fallback options are exhausted."""


@dataclass(slots=True)
class LLMCallResult:
    content: str
    provider: str
    model: str
    usage: UsageNumbers
    request_meta: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class LLMStreamResult:
    provider: str = ""
    model: str = ""
    usage: UsageNumbers | None = None
    content: str = ""
    request_meta: dict[str, Any] = field(default_factory=dict)
    token_stream: AsyncIterator[str] | None = None


def _get_platform(platform_name: str) -> dict:
    cfg = get_config()
    try:
        return cfg["platforms"][platform_name]
    except KeyError as exc:
        raise AIRouterError(f"Unknown platform: {platform_name}") from exc


def _get_client(platform_name: str) -> tuple[AsyncOpenAI, str]:
    cfg = get_config()
    platform = _get_platform(platform_name)
    client = AsyncOpenAI(
        base_url=platform["base_url"],
        api_key=platform["api_key"],
        timeout=cfg["fallback"]["timeout_ms"] / 1000,
    )
    default_model = platform["models"][0]["name"]
    return client, default_model


def get_route(node_type: str) -> dict:
    cfg = get_config()
    routes = cfg.get("node_routes", {})
    if node_type not in routes:
        raise AIRouterError(f"Unknown node type: {node_type}")
    return routes[node_type]


def get_fallback_chain(route_chain: str) -> list[dict]:
    cfg = get_config()
    return cfg["fallback"]["chains"].get(route_chain, [])


def is_proxy_aggregator(platform_name: str) -> bool:
    cfg = get_config()
    return platform_name in cfg["fallback"].get("proxy_aggregator_platforms", [])


def _is_platform_configured(platform_name: str) -> bool:
    platform = _get_platform(platform_name)
    base_url = str(platform.get("base_url", "")).strip()
    api_key = str(platform.get("api_key", "")).strip()
    return bool(base_url and api_key and not base_url.startswith("$") and not api_key.startswith("$"))


def _get_safe_reserve_steps(chain_id: str) -> list[dict]:
    if chain_id != "A":
        return []

    reserve_platforms = ("zhipu", "moonshot")
    reserve_models = {
        "zhipu": "glm-4",
        "moonshot": "moonshot-v1-8k",
    }
    return [
        {"platform": platform_name, "model": reserve_models[platform_name]}
        for platform_name in reserve_platforms
    ]


def _build_fallback_steps(route: dict) -> list[dict]:
    chain_id = route["route_chain"]
    configured_chain = get_fallback_chain(chain_id)
    primary_step = {
        "platform": route["platform"],
        "model": route["default_model"],
    }
    candidates = [primary_step, *configured_chain, *_get_safe_reserve_steps(chain_id)]

    seen: set[tuple[str, str]] = set()
    steps: list[dict] = []
    for step in candidates:
        key = (step["platform"], step["model"])
        if key in seen:
            continue
        seen.add(key)
        steps.append(step)
    return steps


def _format_exhausted_error(chain_id: str, errors: list[str]) -> str:
    if not errors:
        return f"All fallback options for chain '{chain_id}' exhausted."
    return f"All fallback options for chain '{chain_id}' exhausted. Errors: {' | '.join(errors)}"


async def _record_error_attempt(
    *,
    provider: str,
    model: str,
    attempt_index: int,
    is_fallback: bool,
    started_at,
    finished_at,
) -> None:
    await record_usage_event(
        provider=provider,
        model=model,
        status="error",
        usage=UsageNumbers(),
        attempt_index=attempt_index,
        is_fallback=is_fallback,
        started_at=started_at,
        finished_at=finished_at,
    )


async def _call_non_stream(
    *,
    provider: str,
    model: str,
    messages: list[dict],
    attempt_index: int,
    is_fallback: bool,
) -> LLMCallResult:
    client, _ = _get_client(provider)
    started_at = utcnow()
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        stream=False,
    )
    finished_at = utcnow()

    content = response.choices[0].message.content or ""
    usage = parse_openai_usage(getattr(response, "usage", None))
    if usage.total_tokens <= 0:
        usage = estimate_usage_from_messages(messages, content)

    request_meta = {
        "attempt_index": attempt_index,
        "is_fallback": is_fallback,
        "provider_request_id": getattr(response, "id", None),
    }
    await record_usage_event(
        provider=provider,
        model=model,
        status="success",
        usage=usage,
        attempt_index=attempt_index,
        is_fallback=is_fallback,
        started_at=started_at,
        finished_at=finished_at,
        provider_request_id=request_meta["provider_request_id"],
    )
    return LLMCallResult(
        content=content,
        provider=provider,
        model=model,
        usage=usage,
        request_meta=request_meta,
    )


async def _stream_tokens(
    client: AsyncOpenAI,
    model: str,
    messages: list[dict],
    result: LLMStreamResult,
) -> AsyncIterator[str]:
    try:
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            stream_options={"include_usage": True},
        )
    except APIError:
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
        )
    in_thinking = False
    content_parts: list[str] = []
    usage = UsageNumbers()
    provider_request_id: str | None = None

    async for chunk in stream:
        if provider_request_id is None:
            provider_request_id = getattr(chunk, "id", None)

        chunk_usage = parse_openai_usage(getattr(chunk, "usage", None))
        if chunk_usage.total_tokens > 0:
            usage = chunk_usage

        if getattr(chunk, "model", None):
            result.model = str(chunk.model)

        choice = chunk.choices[0] if chunk.choices else None
        delta = getattr(choice, "delta", None)
        if delta is None:
            continue

        reasoning = getattr(delta, "reasoning_content", None)
        if reasoning:
            if not in_thinking:
                content_parts.append("<think>")
                yield "<think>"
                in_thinking = True
            content_parts.append(reasoning)
            yield reasoning

        content = getattr(delta, "content", None)
        if content:
            if in_thinking:
                content_parts.append("</think>")
                yield "</think>"
                in_thinking = False
            content_parts.append(content)
            yield content

    if in_thinking:
        content_parts.append("</think>")
        yield "</think>"

    result.content = "".join(content_parts)
    result.usage = usage if usage.total_tokens > 0 else estimate_usage_from_messages(messages, result.content)
    result.request_meta["provider_request_id"] = provider_request_id


async def call_llm_direct_structured(
    platform_name: str,
    model_name: str,
    messages: list[dict],
    stream: bool = False,
) -> LLMCallResult | LLMStreamResult:
    if not _is_platform_configured(platform_name):
        logger.warning("Direct call target '%s' not configured, falling back to chat_response route", platform_name)
        return await call_llm_structured("chat_response", messages, stream=stream)

    if stream:
        client, _ = _get_client(platform_name)
        result = LLMStreamResult(
            provider=platform_name,
            model=model_name,
            request_meta={"attempt_index": 1, "is_fallback": False},
        )

        async def token_stream() -> AsyncIterator[str]:
            started_at = utcnow()
            yielded_any = False
            try:
                async for token in _stream_tokens(client, model_name, messages, result):
                    yielded_any = True
                    yield token
                await record_usage_event(
                    provider=result.provider,
                    model=result.model or model_name,
                    status="success",
                    usage=result.usage or UsageNumbers(),
                    attempt_index=1,
                    is_fallback=False,
                    started_at=started_at,
                    finished_at=utcnow(),
                    provider_request_id=result.request_meta.get("provider_request_id"),
                )
            except (APITimeoutError, APIError) as exc:
                await _record_error_attempt(
                    provider=platform_name,
                    model=model_name,
                    attempt_index=1,
                    is_fallback=False,
                    started_at=started_at,
                    finished_at=utcnow(),
                )
                logger.warning("Direct streaming call to '%s/%s' failed: %s", platform_name, model_name, exc)
                if yielded_any:
                    raise AIRouterError(f"Streaming interrupted on {platform_name}/{model_name}: {exc}") from exc
                fallback_result = await call_llm_structured("chat_response", messages, stream=True)
                assert isinstance(fallback_result, LLMStreamResult)
                result.provider = fallback_result.provider
                result.model = fallback_result.model
                result.request_meta = fallback_result.request_meta
                async for token in fallback_result.token_stream or _empty_stream():
                    yield token
                result.usage = fallback_result.usage
                result.content = fallback_result.content

        result.token_stream = token_stream()
        return result

    try:
        return await _call_non_stream(
            provider=platform_name,
            model=model_name,
            messages=messages,
            attempt_index=1,
            is_fallback=False,
        )
    except (APITimeoutError, APIError) as exc:
        await _record_error_attempt(
            provider=platform_name,
            model=model_name,
            attempt_index=1,
            is_fallback=False,
            started_at=utcnow(),
            finished_at=utcnow(),
        )
        logger.warning("Direct call to '%s/%s' failed: %s, falling back", platform_name, model_name, exc)
        return await call_llm_structured("chat_response", messages, stream=stream)


async def call_llm_structured(
    node_type: str,
    messages: list[dict],
    stream: bool = False,
) -> LLMCallResult | LLMStreamResult:
    route = get_route(node_type)
    chain_id = route["route_chain"]
    fallback_steps = _build_fallback_steps(route)

    if stream:
        result = LLMStreamResult()

        async def token_stream() -> AsyncIterator[str]:
            errors: list[str] = []

            for index, step in enumerate(fallback_steps, start=1):
                platform_name = step["platform"]
                model_name = step["model"]
                is_fallback = index > 1

                if chain_id == "A" and is_proxy_aggregator(platform_name):
                    logger.warning("Skipping proxy aggregator platform '%s' for chain A", platform_name)
                    continue

                if not _is_platform_configured(platform_name):
                    logger.warning("Skipping unconfigured platform '%s' for chain %s", platform_name, chain_id)
                    continue

                result.provider = platform_name
                result.model = model_name
                result.request_meta = {"attempt_index": index, "is_fallback": is_fallback}

                yielded_any = False
                started_at = utcnow()
                try:
                    client, _ = _get_client(platform_name)
                    async for token in _stream_tokens(client, model_name, messages, result):
                        yielded_any = True
                        yield token
                    await record_usage_event(
                        provider=result.provider,
                        model=result.model or model_name,
                        status="success",
                        usage=result.usage or UsageNumbers(),
                        attempt_index=index,
                        is_fallback=is_fallback,
                        started_at=started_at,
                        finished_at=utcnow(),
                        provider_request_id=result.request_meta.get("provider_request_id"),
                    )
                    return
                except (APITimeoutError, APIError) as exc:
                    await _record_error_attempt(
                        provider=platform_name,
                        model=model_name,
                        attempt_index=index,
                        is_fallback=is_fallback,
                        started_at=started_at,
                        finished_at=utcnow(),
                    )
                    logger.warning(
                        "Streaming platform '%s' model '%s' failed: %s, trying next fallback",
                        platform_name,
                        model_name,
                        exc,
                    )
                    if yielded_any:
                        raise AIRouterError(f"Streaming interrupted on {platform_name}/{model_name}: {exc}") from exc
                    errors.append(f"{platform_name}/{model_name}: {exc}")
                    continue

            raise AIRouterError(_format_exhausted_error(chain_id, errors))

        result.token_stream = token_stream()
        return result

    errors: list[str] = []
    for index, step in enumerate(fallback_steps, start=1):
        platform_name = step["platform"]
        model_name = step["model"]
        is_fallback = index > 1

        if chain_id == "A" and is_proxy_aggregator(platform_name):
            logger.warning("Skipping proxy aggregator platform '%s' for chain A", platform_name)
            continue

        if not _is_platform_configured(platform_name):
            logger.warning("Skipping unconfigured platform '%s' for chain %s", platform_name, chain_id)
            continue

        started_at = utcnow()
        try:
            return await _call_non_stream(
                provider=platform_name,
                model=model_name,
                messages=messages,
                attempt_index=index,
                is_fallback=is_fallback,
            )
        except (APITimeoutError, APIError) as exc:
            await _record_error_attempt(
                provider=platform_name,
                model=model_name,
                attempt_index=index,
                is_fallback=is_fallback,
                started_at=started_at,
                finished_at=utcnow(),
            )
            logger.warning(
                "Platform '%s' model '%s' failed: %s, trying next fallback",
                platform_name,
                model_name,
                exc,
            )
            errors.append(f"{platform_name}/{model_name}: {exc}")
            continue

    raise AIRouterError(_format_exhausted_error(chain_id, errors))


async def _empty_stream() -> AsyncIterator[str]:
    if False:
        yield ""


async def call_llm_direct(
    platform_name: str,
    model_name: str,
    messages: list[dict],
    stream: bool = False,
) -> str | AsyncIterator[str]:
    result = await call_llm_direct_structured(platform_name, model_name, messages, stream=stream)
    if stream:
        assert isinstance(result, LLMStreamResult)
        return result.token_stream or _empty_stream()
    assert isinstance(result, LLMCallResult)
    return result.content


async def call_llm(
    node_type: str,
    messages: list[dict],
    stream: bool = False,
) -> str | AsyncIterator[str]:
    result = await call_llm_structured(node_type, messages, stream=stream)
    if stream:
        assert isinstance(result, LLMStreamResult)
        return result.token_stream or _empty_stream()
    assert isinstance(result, LLMCallResult)
    return result.content
