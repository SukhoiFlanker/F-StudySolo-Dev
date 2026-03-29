"""AI workflow generation routes: /api/ai/*"""

import re

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user
from app.models.ai import GenerateWorkflowRequest, GenerateWorkflowResponse
from app.services.usage_ledger import bind_usage_request, create_usage_request, finalize_usage_request
from app.services.workflow_generator import extract_json, generate_workflow_core

router = APIRouter()

# ── Prompt injection protection ──────────────────────────────────────────────

_INJECTION_PATTERNS = [
    re.compile(r"忽略(以上|上面|前面|之前)(所有|全部)?指令", re.IGNORECASE),
    re.compile(r"ignore (all |previous |above )?instructions?", re.IGNORECASE),
    re.compile(r"^system\s*:", re.IGNORECASE | re.MULTILINE),
    re.compile(r"<\s*system\s*>", re.IGNORECASE),
    re.compile(r"你现在是", re.IGNORECASE),
    re.compile(r"act as", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"DAN\b", re.IGNORECASE),
]


def sanitize_user_input(text: str) -> str:
    """Escape/neutralize potential prompt injection patterns."""
    for pattern in _INJECTION_PATTERNS:
        text = pattern.sub("[FILTERED]", text)
    return f"[USER_INPUT_START]\n{text}\n[USER_INPUT_END]"


# Keep old name accessible for test imports
_extract_json = extract_json


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/generate-workflow", response_model=GenerateWorkflowResponse)
async def generate_workflow(
    body: GenerateWorkflowRequest,
    current_user: dict = Depends(get_current_user),
):
    usage_request = await create_usage_request(
        user_id=current_user["id"],
        source_type="assistant",
        source_subtype="generate_workflow",
    )
    request_status = "completed"

    with bind_usage_request(usage_request):
        try:
            safe_input = sanitize_user_input(body.user_input)
            return await generate_workflow_core(body, safe_input)
        except HTTPException:
            request_status = "failed"
            raise
        except Exception:
            request_status = "failed"
            raise
        finally:
            await finalize_usage_request(usage_request.request_id, request_status)
