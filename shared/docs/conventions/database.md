<!-- 编码：UTF-8 -->

# 🗄️ 共享 Supabase 数据库规范（快速参考版）

> **完整规范**：[docs/Plans/daily_plan/shared_database/07-shared-supabase-database-convention.md](../Plans/daily_plan/shared_database/07-shared-supabase-database-convention.md)  
> **本文档**：精简版快速参考，便于日常开发时查阅  
> **最后更新**：2026-02-28

---

## 核心规则（3 条）

1. **表名前缀**：`ss_`（StudySolo）/ `pt_`（Platform）/ 无前缀（共享）
2. **用户体系**：`auth.users`（认证）→ `user_profiles`（业务信息）→ `ss_*` / `pt_*`（业务数据）
3. **RLS 必须**：所有表必须启用 RLS，Policy 中使用 `(select auth.uid())` 而非 `auth.uid()`

---

## 表名清单速查

| 类别 | 前缀 | 示例表名 |
|------|------|---------|
| **共享** | 无 | `user_profiles`, `subscriptions`, `verification_codes_v2` |
| **StudySolo** | `ss_` | `ss_workflows`, `ss_workflow_runs`, `ss_usage_daily` |
| **Platform** | `pt_` | `pt_conversations`, `pt_messages`, `pt_ai_models` |

---

## Supabase 连接信息

| 配置项 | 值 |
|--------|-----|
| Project ID | `hofcaclztjazoytmckup` |
| URL | `https://hofcaclztjazoytmckup.supabase.co` |
| Cookie Domain（生产） | `.1037solo.com` |

> ⚠️ **Service Role Key 和 Anon Key 均存储在各项目的 `.env` 文件中，严禁提交到 Git**

---

## 新建表检查清单

建表前必须确认：

- [ ] 表名是否使用了正确前缀（`ss_` / `pt_` / 无前缀）？
- [ ] 是否启用了 RLS？
- [ ] RLS Policy 中是否使用 `(select auth.uid())` 而非 `auth.uid()`？
- [ ] `user_id` 外键是否指向 `user_profiles(id)`（UUID 类型）？
- [ ] 是否需要在 `docs/share/` 中记录此表（如果涉及跨项目影响）？

---

*指向完整规范 → [07-shared-supabase-database-convention.md](../Plans/daily_plan/shared_database/07-shared-supabase-database-convention.md)*
