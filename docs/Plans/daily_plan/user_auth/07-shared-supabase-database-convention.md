# 共享 Supabase 数据库规范 · 跨项目命名与隔离策略

> 📅 创建日期：2026-02-28  
> 📌 所属模块：user_auth · 用户认证与权限  
> 🔗 关联文档：[04-sso-cross-project-auth](./04-sso-cross-project-auth.md) · [vip-01-membership-system-design](./vip-01-membership-system-design.md)  
> 🎯 定位：**两个项目（StudySolo + 1037Solo Platform）共享同一个 Supabase Project 时的数据库命名规范、用户表设计、数据隔离策略**

---

## 一、当前数据库现状分析

### 1.1 Supabase 项目清单

| Supabase Project | Project ID | 实际用途 |
|:---|:---|:---|
| `StudySolo` | `hofcaclztjazoytmckup` | **两个项目共用**（当前已有 Platform 的表） |
| `AIMFllys_share` | `rithloxzperfgiqyquch` | 个人主页/分享站（独立，不参与 SSO） |

### 1.2 当前 `StudySolo` 项目 public schema 中的表

**属于 1037Solo Platform 的表（已存在）：**

| 表名 | 数据量 | 说明 |
|:---|:---:|:---|
| `users` | 1 行 | Platform 用户表（id=TEXT, 有 password_hash, fingerprint 等） |
| `sessions` | 0 | Platform 自建 session 表 |
| `conversations` | 0 | AI 对话列表 |
| `messages` | 0 | AI 对话消息 |
| `conversation_folders` | 0 | 对话文件夹 |
| `ai_models` | 0 | AI 模型配置 |
| `user_preferences` | 1 | 用户偏好设置 |
| `usage_daily` | 0 | 每日用量 |
| `usage_stats` | 0 | 用量统计 |
| `user_model_limits` | 0 | 用户模型限额 |
| `redeem_codes` | 0 | 兑换码 |
| `redeem_logs` | 1 | 兑换记录 |
| `message_feedback` | 0 | 消息反馈 |
| `verification_codes` | 0 | 验证码（Platform 版） |
| `user_login_logs` | 0 | 登录日志 |
| `api_call_logs` | 0 | API 调用日志 |
| `site_stats` | 0 | 站点统计 |

**属于 StudySolo 的表：** ❌ 尚未创建（`001_init.sql` 从未执行）

### 1.3 核心冲突点

| 冲突表名 | Platform 已有 | StudySolo 需要 | 冲突类型 |
|:---|:---|:---|:---|
| `users` | ✅ id=TEXT, password_hash | ✅ id=UUID, 关联 auth.users | **结构完全不同** |
| `sessions` | ✅ 自建 token session | ❌ 不需要（用 Supabase Auth） | 名称冲突 |
| `verification_codes` | ✅ 已有 | ✅ 需要（结构不同） | **结构不同** |

---

## 二、核心决策：用户表是一张还是两张？

### 2.1 决策：一张共享用户表 + 各自业务表

**用户认证层**：共享 `auth.users`（Supabase 内置，SSO 的基础）

**用户业务信息层**：共享一张 `public.user_profiles` 表

**理由：**

1. SSO 的本质就是"同一个用户，跨项目免登录"。如果用两张用户表，SSO 就失去意义了。
2. `auth.users` 是 Supabase 管理的，存储认证信息（email, password hash, JWT）。我们不直接操作它。
3. `public.user_profiles` 是我们的业务用户表，存储两个项目共享的用户属性（昵称、头像、会员等级、学生认证等）。
4. 各项目的专属业务数据（工作流、对话等）通过 `user_id` 外键关联到 `user_profiles.id`。

### 2.2 用户数据分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    auth.users                            │
│  Supabase 内置，不可直接修改 schema                        │
│  存储：id(UUID), email, encrypted_password, metadata     │
│  两个项目共享，SSO 的基础                                  │
└──────────────────────┬──────────────────────────────────┘
                       │ id = auth.uid()
                       ▼
┌─────────────────────────────────────────────────────────┐
│               public.user_profiles                       │
│  共享用户业务信息表                                        │
│  id UUID PK REFERENCES auth.users(id)                    │
│  nickname, avatar_url, tier, is_student_verified...      │
│  两个项目共享                                              │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
    ┌──────▼──────┐                ┌──────▼──────┐
    │  ss_*  表    │                │  pt_*  表    │
    │ StudySolo    │                │ Platform     │
    │ 专属业务表    │                │ 专属业务表    │
    └─────────────┘                └─────────────┘
```

---

## 三、数据库命名规范

### 3.1 表名前缀规则

| 前缀 | 归属 | 示例 |
|:---|:---|:---|
| **无前缀** | 两个项目共享的表 | `user_profiles`, `subscriptions`, `verification_codes` |
| **`ss_`** | StudySolo 专属表 | `ss_workflows`, `ss_workflow_runs`, `ss_usage_daily` |
| **`pt_`** | 1037Solo Platform 专属表 | `pt_conversations`, `pt_messages`, `pt_ai_models` |

### 3.2 为什么用前缀而不用 schema 隔离？

| 方案 | 优点 | 缺点 | 推荐 |
|:---|:---|:---|:---:|
| **表名前缀** | 简单直观，RLS 正常工作，Supabase Dashboard 友好 | 表名稍长 | ✅ |
| 多 schema | 物理隔离更彻底 | Supabase RLS 跨 schema 复杂，Dashboard 不友好 | ❌ |
| 多 Supabase Project | 完全隔离 | 无法共享 auth.users，SSO 不可能 | ❌ |

### 3.3 完整表名清单

#### 共享表（无前缀）

| 表名 | 说明 | 关联项目 |
|:---|:---|:---|
| `user_profiles` | 用户业务信息（昵称、头像、会员等级） | 双方 |
| `subscriptions` | 会员订阅记录 | 双方 |
| `addon_purchases` | 加购项记录 | 双方 |
| `payment_records` | 支付流水 | 双方 |
| `tier_change_log` | 等级变更日志 | 双方 |
| `student_verifications` | 学生认证记录 | 双方 |
| `verification_codes_v2` | 邮件验证码（新版，替代旧表） | 双方 |

#### StudySolo 专属表（`ss_` 前缀）

| 表名 | 说明 |
|:---|:---|
| `ss_workflows` | 工作流 |
| `ss_workflow_runs` | 工作流运行记录 |
| `ss_usage_daily` | StudySolo 每日用量统计 |

#### 1037Solo Platform 专属表（`pt_` 前缀）

| 表名 | 当前表名（需迁移） | 说明 |
|:---|:---|:---|
| `pt_conversations` | `conversations` | AI 对话 |
| `pt_messages` | `messages` | 对话消息 |
| `pt_conversation_folders` | `conversation_folders` | 对话文件夹 |
| `pt_ai_models` | `ai_models` | AI 模型配置 |
| `pt_user_preferences` | `user_preferences` | 用户偏好 |
| `pt_usage_daily` | `usage_daily` | Platform 每日用量 |
| `pt_usage_stats` | `usage_stats` | 用量统计 |
| `pt_user_model_limits` | `user_model_limits` | 模型限额 |
| `pt_redeem_codes` | `redeem_codes` | 兑换码 |
| `pt_redeem_logs` | `redeem_logs` | 兑换记录 |
| `pt_message_feedback` | `message_feedback` | 消息反馈 |
| `pt_user_login_logs` | `user_login_logs` | 登录日志 |
| `pt_api_call_logs` | `api_call_logs` | API 调用日志 |
| `pt_site_stats` | `site_stats` | 站点统计 |
| `pt_sessions` | `sessions` | Platform 自建 session |

---

## 四、用户表迁移方案

### 4.1 当前 Platform `users` 表的问题

当前 Platform 的 `users` 表：
- `id` 是 `TEXT` 类型（不是 UUID）
- 有 `password_hash` 字段（自建认证，没用 Supabase Auth）
- 有 `fingerprint`, `login_count` 等 Platform 专属字段
- RLS 未启用

这与 Supabase Auth + SSO 的架构完全不兼容。

### 4.2 迁移路径

```
Phase 1（当前）：
  - Platform 保持现有 users 表不动（重命名为 pt_users_legacy）
  - 创建新的共享 user_profiles 表
  - StudySolo 直接使用新表

Phase 2（Platform 接入 SSO 时）：
  - Platform 迁移到 Supabase Auth
  - 将 pt_users_legacy 中的数据迁移到 auth.users + user_profiles
  - Platform 所有表的 user_id 从 TEXT 改为 UUID
  - 删除 pt_users_legacy

Phase 3（清理）：
  - 重命名所有 Platform 旧表加上 pt_ 前缀
  - 删除旧的 verification_codes 表
  - 启用所有表的 RLS
```

### 4.3 共享 user_profiles 表设计

```sql
CREATE TABLE user_profiles (
    -- 主键关联 Supabase Auth
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 基础信息（两个项目共享）
    email TEXT UNIQUE NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    
    -- 会员体系（两个项目共享）
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'pro_plus', 'ultra')),
    tier_expires_at TIMESTAMPTZ,
    
    -- 学生认证（两个项目共享）
    is_student_verified BOOLEAN DEFAULT false,
    student_verified_at TIMESTAMPTZ,
    
    -- 存储配额（两个项目共享）
    storage_used_bytes BIGINT DEFAULT 0,
    preferred_currency TEXT DEFAULT 'CNY' CHECK (preferred_currency IN ('CNY', 'USD')),
    
    -- 来源追踪
    registered_from TEXT DEFAULT 'studysolo' CHECK (registered_from IN ('studysolo', 'platform')),
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON user_profiles FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "users_insert_own" ON user_profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "users_update_own" ON user_profiles FOR UPDATE USING ((select auth.uid()) = id);
```

---

## 五、RLS 策略规范

### 5.1 所有表必须启用 RLS

```sql
-- 共享表
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- StudySolo 表
ALTER TABLE ss_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ss_workflow_runs ENABLE ROW LEVEL SECURITY;

-- Platform 表（迁移时启用）
ALTER TABLE pt_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_messages ENABLE ROW LEVEL SECURITY;
```

### 5.2 标准 RLS Policy 模板

> ⚠️ 注意：必须使用 `(select auth.uid())` 而非 `auth.uid()`，避免逐行重新计算影响性能

```sql
-- 用户只能访问自己的数据
CREATE POLICY "{table}_select_own" ON {table}
    FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "{table}_insert_own" ON {table}
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "{table}_update_own" ON {table}
    FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "{table}_delete_own" ON {table}
    FOR DELETE USING ((select auth.uid()) = user_id);
```

---

## 六、Cookie 与 SSO 配置

### 6.1 环境变量控制 cookieDomain

```env
# 生产环境（两个项目的 .env 都加）
NEXT_PUBLIC_COOKIE_DOMAIN=.1037solo.com

# 本地开发（不设置此变量，使用默认行为）
# NEXT_PUBLIC_COOKIE_DOMAIN=  ← 留空或不设置
```

### 6.2 两个项目的 Supabase 配置完全相同

```env
# StudySolo 和 Platform 的 .env 中，以下值完全一致
NEXT_PUBLIC_SUPABASE_URL=https://hofcaclztjazoytmckup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<同一个 anon key>
```

---

## 七、实施优先级

### Phase 1：StudySolo MVP（当前阶段）✅ 已完成

> 📅 执行日期：2026-02-28，通过 Supabase MCP `apply_migration` 执行

| 步骤 | 操作 | 影响 | 状态 |
|:---|:---|:---|:---:|
| 1 | 创建 `user_profiles` 共享表 + 注册触发器 | 不影响 Platform 现有表 | ✅ |
| 2 | 创建 `ss_workflows`, `ss_workflow_runs` | StudySolo 专属 | ✅ |
| 3 | 创建 `ss_usage_daily` | StudySolo 专属 | ✅ |
| 4 | 创建 `verification_codes_v2` | 替代旧表，不删旧表 | ✅ |
| 5 | 创建会员相关共享表 | subscriptions, tier_change_log 等 | ✅ |
| 6 | RLS 性能优化 | `(select auth.uid())` 替代 `auth.uid()` | ✅ |
| 7 | 缺失外键索引补充 | addon_purchases, payment_records | ✅ |

**已执行的 4 个 Migration：**
1. `create_shared_user_profiles` — user_profiles + handle_new_user 触发器
2. `create_studysolo_core_tables` — ss_workflows, ss_workflow_runs, ss_usage_daily
3. `create_shared_membership_tables` — subscriptions, addon_purchases, payment_records, tier_change_log, student_verifications, verification_codes_v2
4. `fix_rls_performance_and_missing_indexes` — RLS 优化 + 索引补充

**已更新的代码文件：**
- `backend/app/api/auth.py` — `/me` 端点改用 `user_profiles`
- `frontend/src/utils/supabase/client.ts` — 添加 cookieDomain SSO
- `frontend/src/utils/supabase/server.ts` — 添加 cookieDomain SSO
- `frontend/src/utils/supabase/middleware.ts` — 添加 cookieDomain SSO + 返回 user
- `frontend/src/middleware.ts` — 改用 Supabase Auth getUser() 鉴权
- `frontend/src/lib/auth/redirect.ts` — URL 安全校验工具

### Phase 2：Platform 接入 SSO（后续）

| 步骤 | 操作 |
|:---|:---|
| 1 | Platform 迁移到 Supabase Auth |
| 2 | 重命名 Platform 旧表加 `pt_` 前缀 |
| 3 | 迁移 `users` 数据到 `auth.users` + `user_profiles` |
| 4 | 启用所有 Platform 表的 RLS |

---

## 八、Platform 兼容性 Q&A（2026-02-28）

> 以下回答 Platform 项目审查后提出的 5 个疑问

### Q1: `users` 旧表何时重命名/清理？

**答**：Phase 2 启动时。当前 Phase 1 完全不动 Platform 的 `users` 表。StudySolo 的所有代码已改为使用 `user_profiles`（UUID 类型 id，关联 `auth.users`），不会向旧 `users` 表写入任何数据。`workflow.py` 中原来的 `users` upsert 已修复为 `user_profiles` upsert。

**时间线建议**：Platform 完成 Supabase Auth 接入后，执行以下步骤：
1. `ALTER TABLE users RENAME TO pt_users_legacy;`
2. 将 `pt_users_legacy` 中的用户数据迁移到 `auth.users` + `user_profiles`
3. 更新 Platform 所有代码中的表引用
4. 确认无引用后删除 `pt_users_legacy`

### Q2: Platform 16 张旧表加 `pt_` 前缀的迁移时间线？

**答**：不急。当前 StudySolo 的新表全部使用 `ss_` 前缀，与 Platform 旧表名称零冲突。`pt_` 前缀重命名可以在 Platform 接入 SSO 时一并执行，也可以分批进行。建议优先级：
1. `users` → `pt_users_legacy`（最紧急，因为名称冲突风险最高）
2. `sessions` → `pt_sessions`（名称通用，容易冲突）
3. 其余表按需重命名

### Q3: `verification_codes` 旧表 vs `verification_codes_v2` 是否长期共存？

**答**：是的，短期内共存。`verification_codes`（旧表）由 Platform 使用，`verification_codes_v2`（新表）由 StudySolo 使用。两张表结构不同（旧表无 UUID 主键），互不干扰。Phase 2 时 Platform 迁移到新表后，旧表可删除。

### Q4: Platform 旧表无 RLS + 共用 anon key = 安全风险？

**答**：**确实存在风险**。当前 Platform 的 17 张旧表全部 RLS 未启用，意味着任何持有 anon key 的客户端都可以通过 PostgREST 直接读写这些表。

**缓解措施（建议 Platform 尽快执行）**：
- 最低限度：对 `users`、`sessions` 等敏感表启用 RLS（即使暂时不加 policy，启用 RLS 后默认拒绝所有访问）
- 或者：将 Platform 旧表移到非 `public` schema（如 `platform` schema），PostgREST 默认不暴露非 public schema

### Q5: Platform 用户迁移到 `auth.users` 时的数据处理流程？

**答**：建议流程：
1. 用 Supabase Admin API 批量创建 `auth.users` 记录（`supabase.auth.admin.createUser`），保留原邮箱
2. 将新生成的 UUID 映射回旧 TEXT id
3. 在 `user_profiles` 中插入对应记录
4. 更新 Platform 所有表的 `user_id` 从 TEXT 改为 UUID（需要 ALTER COLUMN + 数据迁移）
5. 通知用户重置密码（因为旧 `password_hash` 格式可能与 Supabase Auth 不兼容）

---

> **一句话总结**：两个项目共用一个 Supabase Project（`hofcaclztjazoytmckup`），共享 `auth.users` + `user_profiles` 实现 SSO，业务表通过 `ss_`/`pt_` 前缀隔离。当前阶段只创建 StudySolo 的新表，不动 Platform 现有表。
