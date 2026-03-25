"""AI model router — zero hardcoding, all config from config.yaml.

Routes node types to the correct platform/model and handles fallback chains.
Uses the openai Python SDK with base_url + api_key to call any OpenAI-compatible API.
"""

import logging
from collections.abc import AsyncIterator

from openai import AsyncOpenAI, APITimeoutError, APIError

from app.core.config_loader import get_config

logger = logging.getLogger(__name__)


class AIRouterError(Exception):
    """Raised when all fallback options are exhausted."""


def _get_platform(platform_name: str) -> dict:
    """Return the platform config from config.yaml."""
    cfg = get_config()
    try:
        return cfg["platforms"][platform_name]
    except KeyError as exc:
        raise AIRouterError(f"Unknown platform: {platform_name}") from exc


def _get_client(platform_name: str) -> tuple[AsyncOpenAI, str]:
    """Return (AsyncOpenAI client, default_model) for a platform."""
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
    """Return the routing config for a node type from config.yaml."""
    cfg = get_config()
    routes = cfg.get("node_routes", {})
    if node_type not in routes:
        raise AIRouterError(f"Unknown node type: {node_type}")
    return routes[node_type]


def get_fallback_chain(route_chain: str) -> list[dict]:
    """Return the ordered fallback list for a chain (A or B)."""
    cfg = get_config()
    return cfg["fallback"]["chains"].get(route_chain, [])


def is_proxy_aggregator(platform_name: str) -> bool:
    """Return True if the platform is a proxy aggregator (forbidden for chain A)."""
    cfg = get_config()
    return platform_name in cfg["fallback"].get("proxy_aggregator_platforms", [])


def _is_platform_configured(platform_name: str) -> bool:
    """Return True when a platform has resolved connection settings."""
    platform = _get_platform(platform_name)
    base_url = str(platform.get("base_url", "")).strip()
    api_key = str(platform.get("api_key", "")).strip()
    return bool(base_url and api_key and not base_url.startswith("$") and not api_key.startswith("$"))


def _get_safe_reserve_steps(chain_id: str) -> list[dict]:
    """Return additional non-proxy fallbacks not already present in the chain."""
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
    """Build the ordered fallback steps for a node route."""
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
    """Format an actionable fallback exhaustion error."""
    if not errors:
        return f"All fallback options for chain '{chain_id}' exhausted."
    return f"All fallback options for chain '{chain_id}' exhausted. Errors: {' | '.join(errors)}"


async def call_llm_direct(
    platform_name: str,
    model_name: str,
    messages: list[dict],
    stream: bool = False,
) -> str | AsyncIterator[str]:
    """Call a specific platform/model directly, bypassing node_routes.

    Used for forced routing (e.g. thinking modes → deepseek-reasoner).
    Falls back to the default call_llm('chat_response') if the target is unavailable.
    """
    if not _is_platform_configured(platform_name):
        logger.warning("Direct call target '%s' not configured, falling back to chat_response route", platform_name)
        return await call_llm("chat_response", messages, stream=stream)

    client, _ = _get_client(platform_name)

    if stream:
        return _stream_tokens(client, model_name, messages)

    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            stream=False,
        )
        return response.choices[0].message.content or ""
    except (APITimeoutError, APIError) as e:
        logger.warning("Direct call to '%s/%s' failed: %s, falling back", platform_name, model_name, e)
        return await call_llm("chat_response", messages, stream=stream)


async def call_llm(
    node_type: str,
    messages: list[dict],
    stream: bool = False,
) -> str | AsyncIterator[str]:
    """Route a node_type call through the fallback chain.

    Returns the full response string (stream=False) or an async token iterator (stream=True).
    Raises AIRouterError if all fallback options fail.
    """
    route = get_route(node_type)
    chain_id = route["route_chain"]
    fallback_steps = _build_fallback_steps(route)

    if stream:
        return _stream_with_fallback(chain_id, fallback_steps, messages)

    errors: list[str] = []

    for step in fallback_steps:
        platform_name = step["platform"]
        model_name = step["model"]

        # Chain A: skip proxy aggregator platforms
        if chain_id == "A" and is_proxy_aggregator(platform_name):
            logger.warning("Skipping proxy aggregator platform '%s' for chain A", platform_name)
            continue

        if not _is_platform_configured(platform_name):
            logger.warning("Skipping unconfigured platform '%s' for chain %s", platform_name, chain_id)
            continue

        try:
            client, _ = _get_client(platform_name)

            response = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                stream=False,
            )
            return response.choices[0].message.content or ""

        except (APITimeoutError, APIError) as e:
            logger.warning(
                "Platform '%s' model '%s' failed: %s — trying next fallback",
                platform_name, model_name, e,
            )
            errors.append(f"{platform_name}/{model_name}: {e}")
            continue

    raise AIRouterError(_format_exhausted_error(chain_id, errors))


async def _stream_tokens(
    client: AsyncOpenAI,
    model: str,
    messages: list[dict],
) -> AsyncIterator[str]:
    """Yield tokens from a streaming chat completion.

    For models with extended thinking (e.g. DeepSeek R1), the reasoning
    process arrives via `delta.reasoning_content`. We wrap it in <think>
    tags so the frontend can parse and display it in a collapsible card.
    """
    stream = await client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    in_thinking = False
    async for chunk in stream:
        delta = chunk.choices[0].delta
        # DeepSeek R1: reasoning process via reasoning_content
        reasoning = getattr(delta, "reasoning_content", None)
        if reasoning:
            if not in_thinking:
                yield "<think>"
                in_thinking = True
            yield reasoning
        # Final answer via content
        content = delta.content
        if content:
            if in_thinking:
                yield "</think>"
                in_thinking = False
            yield content
    # Ensure the think tag is closed if stream ends mid-reasoning
    if in_thinking:
        yield "</think>"


async def _stream_with_fallback(
    chain_id: str,
    fallback_steps: list[dict],
    messages: list[dict],
) -> AsyncIterator[str]:
    """Stream tokens with fallback before the first token is emitted."""
    errors: list[str] = []

    for step in fallback_steps:
        platform_name = step["platform"]
        model_name = step["model"]

        if chain_id == "A" and is_proxy_aggregator(platform_name):
            logger.warning("Skipping proxy aggregator platform '%s' for chain A", platform_name)
            continue

        if not _is_platform_configured(platform_name):
            logger.warning("Skipping unconfigured platform '%s' for chain %s", platform_name, chain_id)
            continue

        yielded_any = False
        try:
            client, _ = _get_client(platform_name)
            async for token in _stream_tokens(client, model_name, messages):
                yielded_any = True
                yield token
            return
        except (APITimeoutError, APIError) as e:
            logger.warning(
                "Streaming platform '%s' model '%s' failed: %s — trying next fallback",
                platform_name, model_name, e,
            )
            if yielded_any:
                raise AIRouterError(
                    f"Streaming interrupted on {platform_name}/{model_name}: {e}"
                ) from e
            errors.append(f"{platform_name}/{model_name}: {e}")
            continue

    raise AIRouterError(_format_exhausted_error(chain_id, errors))
