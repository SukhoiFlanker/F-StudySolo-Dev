from fastapi.testclient import TestClient

try:
    from jose import jwt as jose_jwt
except ImportError:  # pragma: no cover - local env fallback
    jose_jwt = None

try:
    import jwt as pyjwt
except ImportError:  # pragma: no cover - local env fallback
    pyjwt = None

TEST_JWT_SECRET = "test-secret-for-property-tests-32-bytes-long"


def make_client_with_cookie(
    app,
    cookie_name: str,
    cookie_value: str,
    *,
    raise_server_exceptions: bool = False,
) -> TestClient:
    """Return a TestClient preloaded with a cookie, avoiding per-request cookie warnings."""
    client = TestClient(app, raise_server_exceptions=raise_server_exceptions)
    client.cookies.set(cookie_name, cookie_value)
    return client


def make_bearer_headers(
    user_id: str,
    *,
    email: str | None = None,
    secret: str = TEST_JWT_SECRET,
) -> dict[str, str]:
    """Return Authorization headers for a test JWT."""
    payload = {"sub": user_id, "email": email or f"{user_id}@example.com"}
    if jose_jwt is not None:
        token = jose_jwt.encode(payload, secret, algorithm="HS256")
    elif pyjwt is not None:
        token = pyjwt.encode(payload, secret, algorithm="HS256")
    else:
        # JWTAuthMiddleware validates through a mocked Supabase auth client in these tests,
        # so any opaque bearer token is sufficient when no JWT library is installed.
        token = f"test-token:{user_id}"
    return {"Authorization": f"Bearer {token}"}
