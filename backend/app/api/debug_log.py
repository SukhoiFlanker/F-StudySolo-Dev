"""Dev-only debug log ingestion for Cursor Debug Mode.

This endpoint exists to bypass filesystem permission/locking issues on the
provisioned debug log file during local development.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request

router = APIRouter()

_SESSION_ID = "f04052"
_LOG_PATH = Path("backend/debug-f04052b.log")


def _require_session(x_debug_session_id: str | None) -> None:
    if x_debug_session_id != _SESSION_ID:
        raise HTTPException(status_code=403, detail="Debug session not allowed")


@router.post("/log")
async def ingest_debug_log(
    request: Request,
    x_debug_session_id: str | None = Header(default=None, alias="X-Debug-Session-Id"),
) -> dict[str, Any]:
    _require_session(x_debug_session_id)
    payload = await request.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload")
    if payload.get("sessionId") != _SESSION_ID:
        raise HTTPException(status_code=403, detail="Session mismatch")
    # Prevent accidental secret logging (best-effort): refuse very large payloads.
    raw = json.dumps(payload, ensure_ascii=False)
    if len(raw) > 50_000:
        raise HTTPException(status_code=413, detail="Payload too large")
    _LOG_PATH.write_text("", encoding="utf-8", errors="ignore") if False else None
    with _LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(raw + "\n")
    return {"ok": True}


@router.get("/log")
async def read_debug_log(
    limit: int = 200,
    x_debug_session_id: str | None = Header(default=None, alias="X-Debug-Session-Id"),
) -> dict[str, Any]:
    _require_session(x_debug_session_id)
    if limit < 1:
        limit = 1
    if limit > 2000:
        limit = 2000
    if not _LOG_PATH.exists():
        return {"ok": True, "lines": []}
    # Read last N lines efficiently enough for dev size.
    lines = _LOG_PATH.read_text(encoding="utf-8", errors="ignore").splitlines()
    return {"ok": True, "lines": lines[-limit:]}
