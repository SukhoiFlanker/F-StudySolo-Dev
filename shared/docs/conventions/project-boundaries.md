<!-- 编码：UTF-8 -->

# 📐 项目边界规范 — AI 必读

> **定位**：定义 Platform 与 StudySolo 的技术边界，防止 AI 助手混淆两个项目  
> **最后更新**：2026-02-28

---

## 速查对照表

| 维度 | Platform (`home/`) | StudySolo (`StudySolo/`) |
|------|-------------------|------------------------|
| **前端框架** | React 19 + Vite | Next.js 16.1 App Router |
| **后端框架** | Express.js (Node.js) | FastAPI (Python 3.11+) |
| **CSS 框架** | Tailwind v3 (`tailwind.config.js`) | Tailwind v4.1 (CSS-first, `postcss.config.mjs`) |
| **组件库** | Radix UI | Shadcn/UI |
| **包管理** | npm (`package.json`) | pnpm (`package.json`) |
| **认证方式** | 自建 bcrypt + session token | Supabase Auth (JWT) |
| **Cookie 名** | `auth_token` | `access_token` + `refresh_token` |
| **用户表** | `users` (TEXT id, password_hash) | `user_profiles` (UUID id → auth.users) |
| **表名前缀** | 无前缀（待迁移为 `pt_`） | `ss_` |
| **前端端口** | 3037 | 2037 |
| **后端端口** | 3038 | 2038 |
| **域名** | `platform.1037solo.com` | `studyflow.1037solo.com` |
| **Supabase 前端** | ❌ 不使用 | ✅ anon key + RLS |
| **Supabase 后端** | service_role (绕过 RLS) | service_role + supabase-py 异步 |
| **RLS 状态** | ❌ 未启用 | ✅ 已启用 |

---

## 禁止事项（硬性规则）

### 在 Platform 代码中 ❌ 禁止

- 使用 `db.auth.sign_in` / `db.auth.sign_up`（Supabase Auth API）
- 引用 `user_profiles` 表（Platform 用 `users` 旧表）
- 引用 `ss_*` 前缀的表
- 引用 `StudySolo/` 目录下的任何文件
- 使用 Tailwind v4 CSS-first 语法
- 使用 `pnpm`（Platform 用 `npm`）

### 在 StudySolo 代码中 ❌ 禁止

- 使用 `bcrypt` / 自建 session 认证
- 引用 `users` 表（那是 Platform 旧表，结构完全不同）
- 引用 `pt_*` 前缀的表
- 引用 `home/` 目录下的任何文件
- 使用 Tailwind v3 JS 配置语法
- 使用 `npm`（StudySolo 用 `pnpm`）

---

## 同名但不同的文件

以下文件在两个项目中名称相似但内容/用途完全不同：

| 文件名 | Platform 位置 | StudySolo 位置 | 差异 |
|--------|-------------|---------------|------|
| `auth.*` | `home/server/solo-api/src/routes/auth.js` | `StudySolo/backend/app/api/auth.py` | 语言+认证模式完全不同 |
| `package.json` | `home/package.json` | `StudySolo/frontend/package.json` | 不同依赖和脚本 |
| `tsconfig.json` | `home/tsconfig.json` | `StudySolo/frontend/tsconfig.json` | Vite vs Next.js 配置 |
| `README.md` | `home/README.md` | `StudySolo/README.md` | 不同项目的说明 |

---

*本文件应作为所有 AI 助手的首读文件。*
