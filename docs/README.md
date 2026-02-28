&lt;!-- 编码：UTF-8 --&gt;

# 📁 项目文档总览

这里存放所有非前后端代码的规范文档，包括部署指南、AI 编程总结、更新日志、规划等。

> **📌 共享 Supabase 数据库规范**：本项目与 1037Solo Platform 共享同一个 Supabase Project（`hofcaclztjazoytmckup`）。  
> 核心规范文件位于 `Plans/daily_plan/user_auth/07-shared-supabase-database-convention.md`。

## 目录结构

```
docs/
├── README.md             ← 本文件：文档目录总览
├── architecture.md       ← 项目地图（技术栈·模块划分·数据流向）
├── naming.md             ← 命名规范（变量·文件·API字段·数据库表名前缀）
├── api.md                ← 接口契约（请求·响应·鉴权·端点列表）
├── progress.md           ← 开发进度
│
├── Plans/
│   ├── PROJECT_PLAN.md   ← 项目整体规划方案 v3
│   ├── StudySolo-MVP.md  ← MVP 任务规划（13天冲刺）
│   ├── global/           ← 🌐 全局规划（项目深度功能规划 · 全景视图）
│   ├── daily_plan/       ← 每日计划（按功能模块分子目录）
│   │   ├── user_auth/    ← 用户认证相关规划
│   │   │   ├── 07-shared-supabase-database-convention.md ← 🔑 **共享 Supabase 数据库规范**
│   │   │   ├── 04-sso-cross-project-auth.md
│   │   │   ├── vip-01-membership-system-design.md
│   │   │   └── ...
│   │   ├── core/         ← 核心功能规划
│   │   ├── workflow_canvas/ ← 画布编辑器规划
│   │   └── admin/        ← 管理后台规划
│   └── accumulate_plan/  ← 长期积累性规划与创意池
│
├── Updates/              ← 更新日志（按日期·对标 1037solo 规范）
├── Vibe Coding/          ← AI 编程总结（按功能分类）
├── Source/               ← 规范来源文件暂存（学长分享的核心规范）
├── backup/               ← 备份文件
├── 详细指南/              ← 操作手册（宝塔部署等）
└── 技术指导/              ← 深度技术指导文档
    ├── 核心工作流AI交互深度技术指导/
    └── 混合RAG知识库技术指导/
```

---

## 🗄️ 共享数据库规范速查

> 本项目与 1037Solo Platform 共享同一个 Supabase Project（`hofcaclztjazoytmckup`）

| 前缀 | 归属 | 示例 |
|:---|:---|:---|
| **无前缀** | 共享表 | `user_profiles`, `subscriptions`, `verification_codes_v2` |
| **`ss_`** | StudySolo 专属 | `ss_workflows`, `ss_workflow_runs`, `ss_usage_daily` |
| **`pt_`** | Platform 专属 | `pt_conversations`, `pt_messages`, `pt_ai_models` |

详见：[共享 Supabase 数据库规范](Plans/daily_plan/user_auth/07-shared-supabase-database-convention.md)

---

## 核心规范文档

| 文档 | 说明 |
|------|------|
| [architecture.md](architecture.md) | 项目地图：技术栈选型、模块划分、数据流向 |
| [naming.md](naming.md) | 命名规范：变量、文件、API 字段、**数据库表名前缀** |
| [api.md](api.md) | 接口契约：请求/响应格式、鉴权方式、端点列表 |
| [Plans/daily_plan/user_auth/07-shared-supabase-database-convention.md](Plans/daily_plan/user_auth/07-shared-supabase-database-convention.md) | **🔑 共享 Supabase 数据库规范**（跨项目核心） |

---

*StudySolo Development Team · 最后更新：2026-02-28*