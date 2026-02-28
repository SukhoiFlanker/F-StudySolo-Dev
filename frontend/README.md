# StudySolo Frontend

> **Next.js 16.1 + React 19.2 + Tailwind CSS v4.1 + Shadcn/UI**  
> 🌐 [studyflow.1037solo.com](https://studyflow.1037solo.com) · 端口 2037

## 快速开始

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # → http://localhost:2037
```

## 环境变量

```env
# 共享 Supabase 配置（与 1037Solo Platform 共用同一个 Project）
NEXT_PUBLIC_SUPABASE_URL=https://hofcaclztjazoytmckup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# SSO Cookie 域名（生产环境必需，本地开发不设置）
# NEXT_PUBLIC_COOKIE_DOMAIN=.1037solo.com

# 后端 API
NEXT_PUBLIC_API_BASE_URL=http://localhost:2038
```

> **📌 共享 Supabase**：`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 必须与 Platform 项目完全一致。  
> 详见 [共享 Supabase 数据库规范](../docs/Plans/daily_plan/user_auth/07-shared-supabase-database-convention.md)

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.1 | App Router + Turbopack |
| React | 19.2 | View Transitions + Activity |
| TypeScript | 5.x | 全端类型安全 |
| Tailwind CSS | 4.1 | Oxide 引擎，CSS-first 配置 |
| Shadcn/UI | Latest | 全面支持 Tailwind v4 + React 19 |
| @xyflow/react | 12.x | 工作流可视化画布 |
| Zustand | 5.x | 轻量状态管理 |
| Framer Motion | 12.x | 动画库 |

## Supabase 客户端使用

前端通过 `utils/supabase/` 目录中的工具访问 Supabase：

- **`client.ts`**：浏览器端 Supabase 客户端（仅用于认证）
- **`server.ts`**：服务端 Supabase 客户端（RSC/API Route）
- **`middleware.ts`**：Next.js 中间件中的认证检查

> ⚠️ **业务数据不直接通过 Supabase 客户端访问**，必须走后端 API（`/api/*`）。  
> 前端 Supabase 客户端仅用于认证流程（登录/注册/刷新 Token）。

## 核心目录

```
src/
├── app/                # App Router 路由页面
│   ├── (auth)/         # 登录、注册
│   ├── (dashboard)/    # 三栏布局 + 工作流
│   └── page.tsx        # Landing 首页
├── components/
│   ├── ui/             # Shadcn/UI 基础组件
│   ├── layout/         # Sidebar, Navbar, MobileNav
│   └── business/       # 工作流画布、节点、输入
├── hooks/              # use-workflow-sync, use-workflow-execution
├── stores/             # Zustand Store
├── services/           # auth.service.ts
├── utils/supabase/     # Supabase SSR 客户端（仅认证）
└── types/              # 公共类型定义
```

---

*StudySolo Frontend · 最后更新：2026-02-28*
