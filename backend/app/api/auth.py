"""Authentication routes: /api/auth/*

Uses the **anon** Supabase client for sign_up / sign_in so that Supabase
Auth policies (email verification, rate-limiting) are respected.
Uses the **service_role** client only for admin-level operations like
token validation and profile queries.

Verification codes are sent via Aliyun DirectMail SMTP and stored in
the `verification_codes_v2` table.
"""

import hashlib
import hmac
import logging
import os
import time
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel
from supabase import AsyncClient

from app.core.deps import (
    get_anon_supabase_client,
    get_current_user,
    get_supabase_client,
)
from app.models.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResetPasswordWithCodeRequest,
    SendCodeRequest,
    SyncSessionRequest,
    UserInfo,
    UserLogin,
    UserRegister,
)
from app.services.email_service import (
    send_verification_code_to_email,
    verify_code,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Cookie settings — secure=False in development so cookies work over HTTP
_IS_DEV = os.getenv("ENVIRONMENT", "development").lower() == "development"
_COOKIE_OPTS = dict(
    httponly=True,
    secure=not _IS_DEV,
    samesite="lax",
    path="/",
)
_AUTH_COOKIE_MAX_AGE = int(os.getenv("AUTH_COOKIE_MAX_AGE", str(60 * 60 * 24 * 30)))

# Frontend URL for email redirect links
_FRONTEND_URL = os.getenv("CORS_ORIGIN", "http://localhost:2037")

# Captcha secret — HMAC-based challenge-response verification
_CAPTCHA_SECRET = os.getenv("CAPTCHA_SECRET", "studysolo-captcha-2026")

# ----------- Captcha PRNG (must match frontend mulberry32 exactly) -----------
_PIECE_L = 42
_PIECE_R = 9
_L = _PIECE_L + _PIECE_R * 2 + 3  # 63
_CANVAS_W = 320
_CAPTCHA_TOLERANCE = 6


def _build_cookie_options(remember_me: bool = True) -> dict:
    """Return cookie options, using persistent cookies when remember_me is enabled."""
    options = dict(_COOKIE_OPTS)
    if remember_me:
        options["max_age"] = _AUTH_COOKIE_MAX_AGE
    return options


def _set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
    remember_me: bool = True,
) -> None:
    """Write auth cookies, preserving the remember-me preference."""
    cookie_options = _build_cookie_options(remember_me)
    response.set_cookie(key="access_token", value=access_token, **cookie_options)
    response.set_cookie(key="refresh_token", value=refresh_token, **cookie_options)
    response.set_cookie(
        key="remember_me",
        value="1" if remember_me else "0",
        **cookie_options,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Clear all user auth cookies."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    response.delete_cookie(key="remember_me", path="/")


def _s32(x: int) -> int:
    """Signed 32-bit (JS: x | 0)."""
    x &= 0xFFFFFFFF
    return x - 0x100000000 if x >= 0x80000000 else x


def _u32(x: int) -> int:
    """Unsigned 32-bit (JS: x >>> 0)."""
    return x & 0xFFFFFFFF


def _imul(a: int, b: int) -> int:
    """32-bit multiply (JS: Math.imul)."""
    return _s32(_s32(a) * _s32(b))


def _mulberry32(seed: int):
    """PRNG matching the frontend's mulberry32 implementation."""
    state = [seed]

    def _next() -> float:
        state[0] = _s32(state[0])
        state[0] = _s32(state[0] + 0x6D2B79F5)
        a = state[0]
        t = _imul(a ^ (_u32(a) >> 15), _s32(1 | a))
        imul_r = _imul(_s32(t ^ (_u32(t) >> 7)), _s32(61 | t))
        t = _s32(_s32(t + imul_r) ^ t)
        return _u32(t ^ (_u32(t) >> 14)) / 4294967296

    return _next


def _compute_target_x(seed: int) -> int:
    """Compute the puzzle target X from seed, matching frontend randRange."""
    rng = _mulberry32(seed)
    min_val = _L + 10    # 73
    max_val = _CANVAS_W - _L - 10  # 247
    return int(min_val + rng() * (max_val - min_val))


def _verify_captcha_token(token: str) -> bool:
    """Verify the slider captcha token.

    Token format: "{timestamp}:{hmac_hex}"
    Valid if:
    - HMAC matches the timestamp signed with CAPTCHA_SECRET
    - Timestamp is within 5 minutes of current time
    """
    try:
        parts = token.split(":", 1)
        if len(parts) != 2:
            return False
        ts_str, provided_hmac = parts
        ts = int(ts_str)
        # Check expiry (5 minutes)
        if abs(time.time() - ts) > 300:
            return False
        # Verify HMAC
        expected = hmac.new(
            _CAPTCHA_SECRET.encode(), ts_str.encode(), hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, provided_hmac)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Send verification code
# ---------------------------------------------------------------------------

@router.post("/send-code")
async def send_code(
    body: SendCodeRequest,
    db: AsyncClient = Depends(get_supabase_client),
):
    """Send a 6-digit verification code to the given email.

    Requires a valid slider captcha token. Rate-limited to prevent abuse.
    Supports types: 'register' and 'reset_password'.
    """
    # Verify captcha
    if not _verify_captcha_token(body.captcha_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="人机验证失败，请重新滑动滑块",
        )

    code_type = body.code_type if body.code_type in ("register", "reset_password") else "register"

    # Rate limit: check if a code was sent within the last 60 seconds
    from datetime import datetime, timedelta, timezone
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=60)).isoformat()
    recent = await db.from_("verification_codes_v2").select("id").eq(
        "email", body.email
    ).eq("type", code_type).gte("created_at", cutoff).limit(1).execute()

    if recent.data:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送太频繁，请 60 秒后再试",
        )

    try:
        await send_verification_code_to_email(body.email, code_type, db)
    except Exception as exc:
        logger.exception("Failed to send verification code")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="验证码发送失败，请稍后重试",
        )

    return {"message": "验证码已发送，请查收邮件"}


# ---------------------------------------------------------------------------
# Captcha challenge-response (server-side verified)
# ---------------------------------------------------------------------------


class CaptchaVerifyRequest(BaseModel):
    """Request body for /captcha-token."""
    challenge: str
    x: int


@router.post("/captcha-challenge")
async def generate_captcha_challenge():
    """Generate a puzzle challenge.

    Returns a seed (used by frontend to draw the puzzle) and a signed
    challenge token that embeds the expected answer.
    """
    seed = int.from_bytes(os.urandom(4), "big") % 100000
    target_x = _compute_target_x(seed)
    ts = str(int(time.time()))
    payload = f"{seed}:{target_x}:{ts}"
    sig = hmac.new(
        _CAPTCHA_SECRET.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    challenge = f"{seed}:{ts}:{sig}"
    return {"seed": seed, "challenge": challenge}


@router.post("/captcha-token")
async def verify_captcha_and_issue_token(body: CaptchaVerifyRequest):
    """Verify the user's puzzle answer and return a signed auth token.

    The frontend submits the challenge (from /captcha-challenge) together
    with the X coordinate where the user placed the puzzle piece.
    """
    parts = body.challenge.split(":")
    if len(parts) != 3:
        raise HTTPException(status_code=400, detail="无效的验证挑战")

    seed_str, ts_str, provided_sig = parts
    try:
        seed = int(seed_str)
        ts = int(ts_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的验证挑战")

    # Check expiry (5 minutes)
    if abs(time.time() - ts) > 300:
        raise HTTPException(status_code=400, detail="验证已过期，请刷新重试")

    # Recompute target X from seed
    target_x = _compute_target_x(seed)

    # Verify HMAC (ensures challenge was issued by us and not tampered)
    payload = f"{seed}:{target_x}:{ts_str}"
    expected_sig = hmac.new(
        _CAPTCHA_SECRET.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(status_code=400, detail="无效的验证挑战")

    # Check the user's answer
    if abs(body.x - target_x) > _CAPTCHA_TOLERANCE:
        raise HTTPException(status_code=400, detail="拼合不准确，请重试")

    # Issue signed token
    token_ts = str(int(time.time()))
    token_hmac = hmac.new(
        _CAPTCHA_SECRET.encode(), token_ts.encode(), hashlib.sha256
    ).hexdigest()
    return {"token": f"{token_ts}:{token_hmac}"}


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    body: UserRegister,
    db: AsyncClient = Depends(get_supabase_client),
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
):
    """Create a new user via Supabase Auth.

    Requires a valid verification code sent to the email via /send-code.
    Since we've already verified the email via code, we disable Supabase's
    built-in email confirmation.
    """
    # 1. Verify the email code
    is_valid = await verify_code(body.email, body.verification_code, "register", db)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码无效或已过期，请重新获取",
        )

    # 2. Create user via Supabase Auth (service_role to skip email confirmation)
    try:
        sign_up_data: dict = {
            "email": body.email,
            "password": body.password,
            "options": {
                "email_redirect_to": f"{_FRONTEND_URL}/auth/callback",
            },
        }
        if body.name:
            sign_up_data["options"]["data"] = {
                "name": body.name,
                "nickname": body.name,
            }
        result = await db.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,  # Mark email as confirmed (we already verified)
            "user_metadata": {
                "name": body.name or "",
                "nickname": body.name or "",
            },
        })
    except Exception as exc:
        import traceback
        traceback.print_exc()
        detail = str(exc)
        if "already registered" in detail.lower() or "already been registered" in detail.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="该邮箱已注册，请直接登录或使用忘记密码功能",
            )
        if "unique" in detail.lower() or "duplicate" in detail.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="该邮箱已注册，请直接登录或使用忘记密码功能",
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    if result.user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="注册失败，请检查邮箱格式或密码强度（至少 6 位）",
        )

    return {
        "message": "注册成功，可以直接登录",
        "confirmed": True,
    }


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post("/login")
async def login(
    body: UserLogin,
    response: Response,
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
):
    """Validate credentials via Supabase Auth (anon key) and set HttpOnly cookies."""
    try:
        result = await anon_db.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as exc:
        detail = str(exc)
        if "email not confirmed" in detail.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="邮箱尚未验证，请查收验证邮件并点击确认链接",
            )
        if "invalid" in detail.lower() or "credentials" in detail.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="登录失败，请重试"
        )

    if result.session is None or result.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码错误"
        )

    session = result.session
    user = result.user

    _set_auth_cookies(
        response,
        session.access_token,
        session.refresh_token,
        body.remember_me,
    )

    user_meta = user.user_metadata or {}
    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": UserInfo(
            id=str(user.id),
            email=user.email or "",
            name=user_meta.get("name") or user_meta.get("full_name"),
            avatar_url=user_meta.get("avatar_url"),
            role=user_meta.get("role", "user"),
        ),
    }


# ---------------------------------------------------------------------------
# Logout / Refresh / Password reset / Me
# ---------------------------------------------------------------------------

@router.post("/logout")
async def logout(
    response: Response,
    db: AsyncClient = Depends(get_supabase_client),
    access_token: Annotated[str | None, Cookie()] = None,
):
    """Invalidate the session and clear auth cookies."""
    if access_token:
        try:
            await db.auth.sign_out()
        except Exception:
            pass

    _clear_auth_cookies(response)
    return {"message": "已退出登录"}


@router.post("/refresh")
async def refresh(
    response: Response,
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
    refresh_token: Annotated[str | None, Cookie()] = None,
    remember_me: Annotated[str | None, Cookie()] = None,
):
    """Use the refresh_token cookie to obtain a new access_token."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="缺少 refresh_token"
        )

    try:
        result = await anon_db.auth.refresh_session(refresh_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        )

    if result.session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 刷新失败"
        )

    session = result.session
    keep_signed_in = remember_me != "0"
    _set_auth_cookies(
        response,
        session.access_token,
        session.refresh_token,
        keep_signed_in,
    )
    return {
        "message": "Token 已刷新",
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
    }


@router.post("/sync-session")
async def sync_session(
    body: SyncSessionRequest,
    response: Response,
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
):
    """Restore backend HttpOnly cookies from a browser-persisted Supabase session."""
    try:
        result = await anon_db.auth.set_session(body.access_token, body.refresh_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="本地登录态已失效，请重新登录",
        ) from exc

    if result.session is None or result.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="本地登录态已失效，请重新登录",
        )

    session = result.session
    user = result.user
    _set_auth_cookies(
        response,
        session.access_token,
        session.refresh_token,
        body.remember_me,
    )

    user_meta = user.user_metadata or {}
    return {
        "message": "登录状态已恢复",
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": UserInfo(
            id=str(user.id),
            email=user.email or "",
            name=user_meta.get("name") or user_meta.get("full_name"),
            avatar_url=user_meta.get("avatar_url"),
            role=user_meta.get("role", "user"),
        ),
    }


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncClient = Depends(get_supabase_client),
):
    """Send a password reset verification code via DirectMail.

    Always returns success to prevent email enumeration.
    """
    try:
        await send_verification_code_to_email(body.email, "reset_password", db)
    except Exception:
        pass  # Silently ignore — don't reveal if email exists

    return {"message": "如果该邮箱已注册，你将收到一封包含验证码的邮件"}


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    response: Response,
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
):
    """Reset password using the token from the reset email link (legacy)."""
    try:
        session_result = await anon_db.auth.set_session(
            body.access_token, body.refresh_token
        )
        if not session_result.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="重置链接无效或已过期",
            )

        update_result = await anon_db.auth.update_user({"password": body.new_password})
        if not update_result.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="密码重置失败",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )

    _clear_auth_cookies(response)
    return {"message": "密码重置成功，请使用新密码登录"}


@router.post("/reset-password-with-code")
async def reset_password_with_code(
    body: ResetPasswordWithCodeRequest,
    db: AsyncClient = Depends(get_supabase_client),
):
    """Reset password using email + verification code.

    Uses admin API to look up user by email and update their password.
    """
    # Verify the code
    is_valid = await verify_code(body.email, body.code, "reset_password", db)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码无效或已过期，请重新获取",
        )

    # Find user by email via direct DB query (reliable, O(1))
    try:
        result = await db.from_("user_profiles").select("id").eq(
            "email", body.email
        ).limit(1).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="该邮箱未注册",
            )

        user_id = result.data[0]["id"]

        # Update password via admin API
        await db.auth.admin.update_user_by_id(
            user_id,
            {"password": body.new_password},
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to reset password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码重置失败，请重试",
        )

    return {"message": "密码重置成功，请使用新密码登录"}


@router.post("/resend-verification")
async def resend_verification(
    body: ForgotPasswordRequest,
    anon_db: AsyncClient = Depends(get_anon_supabase_client),
):
    """Resend the email verification link (legacy, kept for compatibility)."""
    try:
        await anon_db.auth.resend(
            {
                "type": "signup",
                "email": body.email,
                "options": {"email_redirect_to": f"{_FRONTEND_URL}/auth/callback"},
            }
        )
    except Exception:
        pass

    return {"message": "如果该邮箱已注册但未验证，你将收到一封新的验证邮件"}


@router.get("/me", response_model=UserInfo)
async def me(
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_supabase_client),
):
    """Return the current authenticated user's info."""
    try:
        result = await db.from_("user_profiles").select("*").eq("id", current_user["id"]).single().execute()
        row = result.data or {}
    except Exception:
        row = {}

    return UserInfo(
        id=current_user["id"],
        email=current_user.get("email") or row.get("email", ""),
        name=row.get("nickname"),
        avatar_url=row.get("avatar_url"),
        role=row.get("tier", current_user.get("role", "user")),
    )
