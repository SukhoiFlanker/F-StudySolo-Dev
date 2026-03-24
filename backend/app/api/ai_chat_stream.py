"""AI Chat Stream route: /api/ai/chat-stream — SSE 流式对话.

CHAT 意图下将 AI token 逐字推送给前端。
BUILD/MODIFY/ACTION 意图不流式, 直接返回 JSON event。
"""

import json
import logging
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.core.deps import get_current_user
from app.models.ai_chat import AIChatRequest
from app.prompts import (
    get_plan_prompt,
    get_chat_prompt,
    get_create_prompt,
    get_intent_prompt,
)
from app.services.ai_router import call_llm, AIRouterError
from app.api.ai_chat import _build_canvas_summary, _call_with_model, _extract_json_obj

logger = logging.getLogger(__name__)
stream_router = APIRouter()

# 思考深度 → prompt 前缀
_DEPTH_INSTRUCTIONS: dict[str, str] = {
    "fast": "请快速简洁地回答, 不需要展开细节。",
    "balanced": "请给出完整但有条理的回答。",
    "deep": "请深入思考, 从多角度详细分析, 给出专业级回答。",
}


async def _chat_stream_generator(body: AIChatRequest):
    """SSE 事件生成器 — CHAT 意图流式, 其他意图单次 JSON。"""
    canvas_summary = _build_canvas_summary(body.canvas_context)
    has_canvas = bool(body.canvas_context and body.canvas_context.nodes)
    depth_instruction = _DEPTH_INSTRUCTIONS.get(body.thinking_level, "")

    history_msgs = [
        {"role": m.role, "content": m.content}
        for m in (body.conversation_history or [])[-10:]
    ]

    # ── 新架构：根据 mode 路由 ────────────────────────────────
    mode = getattr(body, "mode", "chat")

    if mode == "create":
        # ── CREATE 模式 (JSON Tools) ─────────────────────────
        # 在 Create 模式下仍然需要分类器：区分 BUILD (跳转到全量生成路线) 和 ACTION (运行)
        intent = body.intent_hint or "MODIFY"
        
        if not body.intent_hint or body.intent_hint not in ("BUILD", "MODIFY", "ACTION"):
            classify_msgs = [
                {"role": "system", "content": get_intent_prompt(canvas_summary)},
                *history_msgs,
                {"role": "user", "content": body.user_input},
            ]
            try:
                raw, _, _ = await _call_with_model(
                    body.selected_platform, body.selected_model, classify_msgs,
                )
                parsed = _extract_json_obj(raw)
                intent = parsed.get("intent", "MODIFY")
                if intent not in ("BUILD", "MODIFY", "ACTION"):
                    intent = "MODIFY"
            except Exception:
                intent = "BUILD" if not has_canvas else "MODIFY"

        # 处理非图表编辑指令 (BUILD / ACTION)
        if intent in ("BUILD", "ACTION"):
            yield {
                "data": json.dumps(
                    {"intent": intent, "done": True, "response": "正在跳转..."},
                    ensure_ascii=False,
                )
            }
            return

        # 执行 Modify/Create (返回 JSON Actions)
        system_content = get_create_prompt(canvas_summary, body.thinking_level)
        create_msgs = [
            {"role": "system", "content": system_content},
            *history_msgs,
            {"role": "user", "content": body.user_input},
        ]
        
        try:
            raw, plat, mdl = await _call_with_model(
                body.selected_platform, body.selected_model, create_msgs,
            )
            parsed = _extract_json_obj(raw)
            actions_data = parsed.get("tool_calls") or parsed.get("actions", [])
            formatted_actions = []
            for act in actions_data:
                op = act.get("tool", act.get("operation", "")).upper()
                payload = act.get("params", act.get("payload", {}))
                target_id = payload.get("target_node_id") or act.get("target_node_id")
                formatted_actions.append({"operation": op, "target_node_id": target_id, "payload": payload})

            yield {
                "data": json.dumps(
                    {
                        "intent": "MODIFY",
                        "done": True,
                        "response": parsed.get("response", "操作已完成。"),
                        "actions": formatted_actions,
                        "model_used": mdl,
                    },
                    ensure_ascii=False,
                )
            }
        except Exception as e:
            yield {
                "data": json.dumps(
                    {"intent": "MODIFY", "done": True, "response": str(e)},
                    ensure_ascii=False,
                )
            }
        return

    # ── PLAN / CHAT 模式 (流式输出 XML/Text) ─────────────────
    if mode == "plan":
        intent = "PLAN"
        system_content = get_plan_prompt(canvas_summary, body.thinking_level)
    else:
        intent = "CHAT"
        system_content = get_chat_prompt(canvas_summary)

    stream_msgs = [
        {"role": "system", "content": system_content},
        *history_msgs,
        {"role": "user", "content": body.user_input},
    ]

    try:
        yield {"data": json.dumps({"intent": intent}, ensure_ascii=False)}

        token_iter: AsyncIterator[str] = await call_llm(
            "chat_response", stream_msgs, stream=True,
        )

        full = ""
        async for token in token_iter:
            full += token
            yield {"data": json.dumps({"token": token}, ensure_ascii=False)}

        yield {
            "data": json.dumps({"done": True, "full": full}, ensure_ascii=False),
        }
        yield {"data": "[DONE]"}

    except AIRouterError as e:
        yield {
            "data": json.dumps(
                {"error": str(e), "done": True}, ensure_ascii=False,
            )
        }


@stream_router.post("/chat-stream")
async def ai_chat_stream(
    body: AIChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """SSE 流式 AI 对话."""
    return EventSourceResponse(_chat_stream_generator(body))
