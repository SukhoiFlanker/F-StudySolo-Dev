<!-- 编码：UTF-8 -->

# 📋 跨项目决策记录

> **定位**：按时间线记录 Platform 与 StudySolo 之间所有影响双方的关键决策  
> **格式**：每条决策包含 背景、决策内容、影响分析、执行状态  
> **最后更新**：2026-02-28

---

## 2026-02-28

### 决策 #001：共享 Supabase 数据库

**背景**：  
两个项目都需要用户系统和数据库。如果各自一个 Supabase Project，SSO 不可能实现，且成本翻倍（$50/月 vs $25/月）。

**决策内容**：
- 两个项目共享 Supabase Project `hofcaclztjazoytmckup`（原名 StudySolo）
- 共享 `auth.users`（Supabase 内置认证）+ `user_profiles`（业务用户信息）
- 表名前缀隔离：`ss_`（StudySolo）/ `pt_`（Platform）/ 无前缀（共享）

**影响分析**：
| 项目 | 影响 |
|------|------|
| StudySolo | ✅ 新表全部使用 `ss_` 前缀，已在 Phase 1 中创建 |
| Platform | ⏳ 现有 17 张表暂不改动，Phase 2 时加 `pt_` 前缀 |

**执行状态**：✅ Phase 1 已完成（4 个 Migration 已执行）

**详细规范**：[共享 Supabase 数据库规范](./shared-supabase-convention.md)

---

### 决策 #002：SSO 跨域认证方案

**背景**：  
两个子域名（`platform.1037solo.com` + `studyflow.1037solo.com`）需要用户免登录切换。

**决策内容**：
- 使用 Supabase Auth 统一认证
- Cookie Domain 设置为 `.1037solo.com`（生产环境），覆盖所有子域名
- 本地开发不设置 Cookie Domain（默认 localhost）

**影响分析**：
| 项目 | 影响 |
|------|------|
| StudySolo | ✅ 已实现：`client.ts`、`server.ts`、`middleware.ts` 均已加 cookieDomain |
| Platform | ⏳ 待实现：需要从自建认证迁移到 Supabase Auth |

**执行状态**：🔄 StudySolo 侧已完成，Platform 侧待 Phase 2

---

### 决策 #003：Git Subtree Monorepo 合并

**背景**：  
两个项目共享数据库但分属两个 Git 仓库，存在代码分裂风险。需要在 Platform Monorepo 中有 StudySolo 的完整代码引用。

**决策内容**：
- 使用 `git subtree` 将 `AIMFllys/StudySolo` 合并到 `AIMFllys/1037Solo` 的 `StudySolo/` 目录
- **双仓库并行模式**：
  - StudySolo 日常开发在独立仓库（`AIMFllys/StudySolo`）中进行
  - 定期通过 `git subtree pull` 同步到 Platform Monorepo
  - Platform 整体提交时包含 StudySolo 子目录

**影响分析**：
| 项目 | 影响 |
|------|------|
| StudySolo | 🟢 不受影响，独立仓库继续使用 |
| Platform | 🟢 新增 `StudySolo/` 目录，仓库体积增大约 3MB |

**执行状态**：✅ 已完成

---

### 决策 #004：创建 `docs/share/` 共享决策中心

**背景**：  
两个项目的关键决策分散在各自的 docs 中，缺乏统一的跨项目视图。

**决策内容**：
- 在 Platform 仓库中创建 `docs/share/` 目录
- 集中记录所有跨项目决策、共享规范、同步工作流
- 作为两个项目的"会议室"和"单一真相来源"

**影响分析**：
| 项目 | 影响 |
|------|------|
| 双方 | 🟢 便于快速查阅跨项目约定，减少沟通成本 |

**执行状态**：✅ 已完成

---

## 决策模板

```markdown
### 决策 #NNN：标题

**背景**：  
为什么需要做这个决策？

**决策内容**：
- 具体决策条目

**影响分析**：
| 项目 | 影响 |
|------|------|
| StudySolo | ... |
| Platform | ... |

**执行状态**：✅ 已完成 / 🔄 进行中 / ⏳ 待执行

**详细文档**：[链接]()
```

---

*维护者：1037Solo Development Team · 最后更新：2026-02-28*
