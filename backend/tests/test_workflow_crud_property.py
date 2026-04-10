"""
Property-Based Test: 工作流 CRUD 数据往返一致性
Feature: studysolo-mvp, Property 4: 工作流 CRUD 数据往返一致性

Validates: Requirements 3.1, 3.2, 11.3
"""

import sys
from types import ModuleType, SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

# ---------------------------------------------------------------------------
# Stub out 'supabase' before any app module is imported.
# ---------------------------------------------------------------------------

def _install_supabase_stub():
    if "supabase" not in sys.modules:
        stub = ModuleType("supabase")
        stub.AsyncClient = object  # type: ignore[attr-defined]
        stub.create_async_client = AsyncMock()  # type: ignore[attr-defined]
        sys.modules["supabase"] = stub
    for sub in ("supabase._async", "supabase._async.client", "supabase.lib"):
        sys.modules.setdefault(sub, ModuleType(sub))
    async_client_mod = sys.modules["supabase._async.client"]
    if not hasattr(async_client_mod, "AsyncClient"):
        async_client_mod.AsyncClient = object  # type: ignore[attr-defined]


_install_supabase_stub()

import os
import uuid
from datetime import datetime, timezone

import pytest
from hypothesis import given, settings as hyp_settings
from hypothesis import strategies as st
from fastapi.testclient import TestClient
from tests._helpers import TEST_JWT_SECRET, make_bearer_headers

os.environ.setdefault("JWT_SECRET", TEST_JWT_SECRET)
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")

from app.main import app  # noqa: E402
from app.core import deps  # noqa: E402
from app.api.workflow import crud as workflow_crud_module  # noqa: E402
from app.middleware import auth as auth_middleware  # noqa: E402

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_FAKE_USER = {"id": "user-test-001", "email": "test@example.com"}
_NOW = datetime.now(timezone.utc).isoformat()


class _ServiceDbMock:
    def __init__(self, *, nickname: str = "Test User"):
        self.nickname = nickname
        self.table = ""

    def from_(self, table: str):
        self.table = table
        return self

    def select(self, _cols: str):
        return self

    def eq(self, _key: str, _value):
        return self

    def in_(self, _key: str, _value):
        return self

    def single(self):
        return self

    def maybe_single(self):
        return self

    async def execute(self):
        result = MagicMock()
        if self.table == "user_profiles":
            result.data = {"nickname": self.nickname}
        else:
            result.data = []
        return result


@pytest.fixture(autouse=True)
def _stub_workflow_crud_dependencies(monkeypatch):
    async def fake_assert_workflow_quota(*_args, **_kwargs):
        return None

    async def fake_check_workflow_access(workflow_id: str, user_id: str, required_role: str, _db):
        return {
            "workflow": {"id": workflow_id, "user_id": user_id, "name": "stub", "is_public": False},
            "access_role": "owner",
        }

    async def fake_get_user(_token: str):
        return SimpleNamespace(user=SimpleNamespace(id=_FAKE_USER["id"], email=_FAKE_USER["email"]))

    async def fake_auth_db():
        return SimpleNamespace(auth=SimpleNamespace(get_user=fake_get_user))

    monkeypatch.setattr(workflow_crud_module, "assert_workflow_quota", fake_assert_workflow_quota)
    monkeypatch.setattr(workflow_crud_module, "check_workflow_access", fake_check_workflow_access)
    monkeypatch.setattr(auth_middleware, "get_db", fake_auth_db)


def _make_workflow_record(workflow_id: str, name: str, description: str | None) -> dict:
    """Build a fake Supabase workflow row."""
    return {
        "id": workflow_id,
        "user_id": _FAKE_USER["id"],
        "name": name,
        "description": description,
        "nodes_json": [],
        "edges_json": [],
        "status": "draft",
        "created_at": _NOW,
        "updated_at": _NOW,
    }


def _make_supabase_mock(workflow_id: str, name: str, description: str | None):
    """
    Return a mock Supabase AsyncClient whose query chain returns the
    expected workflow record for both insert (POST) and select (GET).
    """
    record = _make_workflow_record(workflow_id, name, description)

    # Track whether insert was called (POST) vs select/single (GET)
    state = {"is_insert": False, "is_single": False}

    chain = MagicMock()

    def _from_(table):
        return chain

    def _insert(payload):
        state["is_insert"] = True
        return chain

    def _single():
        state["is_single"] = True
        return chain

    chain.from_ = MagicMock(side_effect=_from_)
    chain.select = MagicMock(return_value=chain)
    chain.insert = MagicMock(side_effect=_insert)
    chain.upsert = MagicMock(return_value=chain)
    chain.eq = MagicMock(return_value=chain)
    chain.order = MagicMock(return_value=chain)
    chain.single = MagicMock(side_effect=_single)

    async def _execute():
        result = MagicMock()
        if state["is_insert"]:
            result.data = [record]  # insert returns list
            state["is_insert"] = False
        elif state["is_single"]:
            result.data = record   # single() returns dict
            state["is_single"] = False
        else:
            result.data = [record]
        return result

    chain.execute = _execute

    return chain


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

# Valid workflow names: non-empty strings up to 200 chars
_workflow_name = st.text(
    alphabet=st.characters(blacklist_categories=("Cs",)),  # exclude surrogates
    min_size=1,
    max_size=200,
)

# Optional descriptions
_workflow_description = st.one_of(
    st.none(),
    st.text(
        alphabet=st.characters(blacklist_categories=("Cs",)),
        min_size=0,
        max_size=500,
    ),
)


# ---------------------------------------------------------------------------
# Property 4: 工作流 CRUD 数据往返一致性
# ---------------------------------------------------------------------------

@given(name=_workflow_name, description=_workflow_description)
@hyp_settings(max_examples=100)
def test_workflow_crud_roundtrip(name: str, description: str | None):
    """
    **Validates: Requirements 3.1, 3.2, 11.3**

    Property 4: 工作流 CRUD 数据往返一致性
    For any valid workflow data (name, description), after POST creation the
    subsequent GET /api/workflow/{id}/content must return semantically
    equivalent data: same name, same description, and empty nodes_json /
    edges_json (as created by default).
    """
    workflow_id = str(uuid.uuid4())
    db_mock = _make_supabase_mock(workflow_id, name, description)

    # Override FastAPI dependencies for this test
    app.dependency_overrides[deps.get_current_user] = lambda: _FAKE_USER
    app.dependency_overrides[deps.get_supabase_client] = lambda: db_mock
    app.dependency_overrides[deps.get_db] = lambda: _ServiceDbMock()

    headers = make_bearer_headers(_FAKE_USER["id"], email=_FAKE_USER["email"])

    try:
        client = TestClient(app, raise_server_exceptions=False)

        # --- POST: create workflow ---
        create_payload: dict = {"name": name}
        if description is not None:
            create_payload["description"] = description

        post_resp = client.post("/api/workflow/", json=create_payload, headers=headers)
        assert post_resp.status_code == 201, (
            f"POST failed ({post_resp.status_code}): {post_resp.text}"
        )
        post_data = post_resp.json()
        assert post_data["name"] == name, (
            f"POST response name mismatch: expected {name!r}, got {post_data['name']!r}"
        )

        # --- GET: read workflow content ---
        get_resp = client.get(f"/api/workflow/{workflow_id}/content", headers=headers)
        assert get_resp.status_code == 200, (
            f"GET failed ({get_resp.status_code}): {get_resp.text}"
        )
        get_data = get_resp.json()

        # Semantic equivalence checks
        assert get_data["name"] == name, (
            f"GET name mismatch: expected {name!r}, got {get_data['name']!r}"
        )
        assert get_data["description"] == description, (
            f"GET description mismatch: expected {description!r}, got {get_data['description']!r}"
        )
        assert get_data["nodes_json"] == [], (
            f"Expected empty nodes_json on new workflow, got {get_data['nodes_json']!r}"
        )
        assert get_data["edges_json"] == [], (
            f"Expected empty edges_json on new workflow, got {get_data['edges_json']!r}"
        )

    finally:
        app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Baseline unit tests (non-property)
# ---------------------------------------------------------------------------

def test_workflow_roundtrip_simple():
    """Concrete example: create + read a workflow with a plain name."""
    workflow_id = str(uuid.uuid4())
    name = "学习 React Hooks"
    description = "系统学习 React Hooks 的知识体系"
    db_mock = _make_supabase_mock(workflow_id, name, description)
    headers = make_bearer_headers(_FAKE_USER["id"], email=_FAKE_USER["email"])

    app.dependency_overrides[deps.get_current_user] = lambda: _FAKE_USER
    app.dependency_overrides[deps.get_supabase_client] = lambda: db_mock
    app.dependency_overrides[deps.get_db] = lambda: _ServiceDbMock()

    try:
        client = TestClient(app, raise_server_exceptions=False)

        post_resp = client.post("/api/workflow/", json={"name": name, "description": description}, headers=headers)
        assert post_resp.status_code == 201
        assert post_resp.json()["name"] == name

        get_resp = client.get(f"/api/workflow/{workflow_id}/content", headers=headers)
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["name"] == name
        assert data["description"] == description
        assert data["nodes_json"] == []
        assert data["edges_json"] == []
    finally:
        app.dependency_overrides.clear()


def test_workflow_roundtrip_no_description():
    """Concrete example: create + read a workflow without description."""
    workflow_id = str(uuid.uuid4())
    name = "无描述工作流"
    db_mock = _make_supabase_mock(workflow_id, name, None)
    headers = make_bearer_headers(_FAKE_USER["id"], email=_FAKE_USER["email"])

    app.dependency_overrides[deps.get_current_user] = lambda: _FAKE_USER
    app.dependency_overrides[deps.get_supabase_client] = lambda: db_mock
    app.dependency_overrides[deps.get_db] = lambda: _ServiceDbMock()

    try:
        client = TestClient(app, raise_server_exceptions=False)

        post_resp = client.post("/api/workflow/", json={"name": name}, headers=headers)
        assert post_resp.status_code == 201

        get_resp = client.get(f"/api/workflow/{workflow_id}/content", headers=headers)
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["name"] == name
        assert data["description"] is None
        assert data["nodes_json"] == []
        assert data["edges_json"] == []
    finally:
        app.dependency_overrides.clear()
