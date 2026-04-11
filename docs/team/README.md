# StudySolo 团队协作中心

> 最后更新：2026-04-11
> 定位：本目录用于存放所有团队组织与代码协作指南。

---

## 团队规范文档导航

| 文档 | 作用简介 |
|------|----------|
| [**团队分工与职责**](roles.md) | 3 人小队的人员角色划分（羽升 / 小李 / 小陈）、主线与独立任务所有权 |
| [**分支与 Commit 规范**](commit-conventions.md) | 分支命名格式、Commit Message 格式、Scope 与保护规则 |
| [**PR 与 Code Review**](pr-workflow.md) | Pull Request 合并策略、模块边界原则、代码审查清单 |
| [**Issue 管理规范**](issue-management.md) | Bug 上报流程、安全漏洞私密上报流程、标签体系 |
| [**接口同步规范**](interface-sync.md) | 接口冻结原则、子后端/Wiki 边界对接、文档先行原则 |

---

## 其他重要流程入口

- [双仓库协作 SOP（日常/比赛期维护）](../项目规范与框架流程/功能流程/双仓库协作流程.md) — ⚠️ §3.1 「直接 push main」已过期，请以 [commit-conventions.md](commit-conventions.md) 为准
- [全面代码重构计划导航](refactor/README.md)

---

## 文档权威层级

当多份文档描述同一主题时，以下优先级决定哪份"说了算"：

| 优先级 | 文档位置 | 说明 |
|--------|---------|------|
| **L0（最高）** | `docs/team/*.md` | 团队协作铁规，本目录文件 |
| **L0** | `.github/CODEOWNERS` | 代码所有权，GitHub 系统强制 |
| **L0** | `shared/docs/conventions/` | 共享层事实，跨项目稳定 |
| **L1** | `docs/team/refactor/final-plan/` | 重构实施方案，以 Phase 状态为准 |
| **L1** | `docs/项目规范与框架流程/` | 功能 SOP（注意废弃标记） |
| **L2** | `agents/README.md` | Agent 开发指南，引用 final-plan |
| **L3（参考）** | `docs/team/refactor/claude-analysis/` | 历史分析，只读，不作执行依据 |
| **L3（参考）** | `docs/team/refactor/codex-analysis/` | 历史分析，只读，不作执行依据 |

> 冲突解决原则：L0 > L1 > L2 > L3。同级冲突以最新更新日期为准。

