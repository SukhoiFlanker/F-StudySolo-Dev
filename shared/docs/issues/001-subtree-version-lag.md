<!-- 编码：UTF-8 -->

# 🚨 Subtree 同步缺陷报告 — 需 Kiro 执行

> 📅 2026-02-28 · **状态：待处理**  
> 📌 **问题性质**：Subtree 合并版本落后，代码中存在数据库表名引用错误  
> 🎯 **解决方式**：在 Platform 仓库中执行 `git subtree pull` 同步最新代码

---

## 一、核心问题

**Git Subtree 合并进来的 StudySolo 代码是旧版本**，独立仓库 `AIMFllys/StudySolo` 中已修复的问题在 Monorepo 的 `StudySolo/` 目录中仍然存在。

### 1.1 差异对比（已验证）

| 文件 | Monorepo 旧版（`StudySolo/` 子目录） | 独立仓库最新版 | 问题 |
|------|--------------------------------------|---------------|------|
| `backend/app/api/auth.py:141` | `db.from_("users")` | `db.from_("user_profiles")` | ❌ 引用了 Platform 的旧表 |
| `backend/app/api/auth.py:149` | `row.get("name")` | `row.get("nickname")` | ❌ 字段名错误 |
| `backend/app/api/auth.py:151` | `row.get("role", ...)` | `row.get("tier", ...)` | ❌ 字段名不匹配 user_profiles |
| `backend/app/api/workflow.py:46` | `db.from_("users").upsert(...)` | **行已删除** | ❌ 不应向 users 表 upsert |
| `backend/app/api/workflow.py:25` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 缺少 ss_ 前缀 |
| `backend/app/api/workflow.py:63` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |
| `backend/app/api/workflow.py:84` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |
| `backend/app/api/workflow.py:109` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |
| `backend/app/api/workflow.py:130` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |
| `backend/app/api/workflow.py:154` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |
| `backend/app/api/workflow.py:169` | `db.from_("workflows")` | `db.from_("ss_workflows")` | ❌ 同上 |

### 1.2 问题严重程度

- **`users` → `user_profiles`**：🔴 **高危** — `users` 表是 Platform 的旧表（TEXT id, password_hash），结构完全不同。如果 StudySolo 向 `users` 表 upsert，会导致数据污染。
- **`workflows` → `ss_workflows`**：🔴 **高危** — 数据库中实际创建的表名是 `ss_workflows`，引用 `workflows` 会导致运行时 HTTP 500 错误。

---

## 二、解决方案

### 方案 A：在 Platform 仓库执行 subtree pull（推荐）

```bash
cd d:\project\1037solo\platform.1037solo.com
git subtree pull --prefix=StudySolo https://github.com/AIMFllys/StudySolo.git main --squash
```

这会把独立仓库的最新修复同步过来。

### 方案 B：如果独立仓库也还有未推送的修复

确保先在独立仓库中推送：

```bash
cd d:\project\Study_1037Solo\StudySolo
git push origin main
```

然后再执行方案 A。

---

## 三、Kiro 验证清单

Subtree pull 后，请 Kiro 验证以下内容：

### 3.1 代码层验证

- [ ] `StudySolo/backend/app/api/auth.py:141` 引用 `user_profiles` 而非 `users`
- [ ] `StudySolo/backend/app/api/workflow.py` 全文引用 `ss_workflows` 而非 `workflows`
- [ ] `StudySolo/backend/app/api/workflow.py` 不包含 `db.from_("users").upsert` 行

### 3.2 数据库层验证（需 Supabase MCP）

请 Kiro 通过 Supabase MCP 验证：

- [ ] 表 `ss_workflows` 存在且结构正确
- [ ] 表 `ss_workflow_runs` 存在且有外键指向 `ss_workflows`
- [ ] 表 `user_profiles` 存在且 `id` 是 UUID 类型
- [ ] `user_profiles` 的 `id` 外键指向 `auth.users(id)`
- [ ] 表 `ss_workflows` 的 RLS 已启用
- [ ] 旧 `users` 表未被 StudySolo 的任何代码引用

### 3.3 给 Kiro 的提示词

```
我需要你验证 StudySolo 项目的数据库引用是否正确：

1. 请通过 Supabase MCP 检查以下表是否存在：
   - user_profiles（共享表，无前缀）
   - ss_workflows（StudySolo 专属，ss_ 前缀）
   - ss_workflow_runs（StudySolo 专属，ss_ 前缀）

2. 检查 backend/app/api/ 下所有 Python 文件中的 from_() 调用，
   确保没有引用旧表名 "users" 或无前缀的 "workflows"

3. 如果发现引用错误，按以下规则修复：
   - "users" → "user_profiles"
   - "workflows" → "ss_workflows"
   - "workflow_runs" → "ss_workflow_runs"

这是 StudySolo 项目（Next.js 16 + FastAPI），不是 Platform 项目。
StudySolo 使用 Supabase Auth（不是自建认证），
业务表使用 ss_ 前缀（不是 pt_ 前缀，那是 Platform 的）。
```

---

## 四、数据库表现状确认

### 已通过 Supabase MCP 执行的 4 个 Migration：

1. `create_shared_user_profiles` — `user_profiles` + `handle_new_user` 触发器
2. `create_studysolo_core_tables` — `ss_workflows`, `ss_workflow_runs`, `ss_usage_daily`
3. `create_shared_membership_tables` — `subscriptions`, `addon_purchases` 等
4. `fix_rls_performance_and_missing_indexes` — RLS 优化 + 索引

### 表名规范速查

| 类别 | 前缀 | 示例 |
|------|------|------|
| 共享 | 无前缀 | `user_profiles`, `subscriptions` |
| StudySolo | `ss_` | `ss_workflows`, `ss_workflow_runs`, `ss_usage_daily` |
| Platform | `pt_`（待迁移） | 当前仍为无前缀旧名（`users`, `conversations` 等） |

---

*报告生成：2026-02-28 18:41 · 待 Kiro 处理*
