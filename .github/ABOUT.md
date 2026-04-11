# .github 团队协作配置

> 本目录包含 StudySolo 项目的 GitHub 团队协作规范与自动化配置。

---

## 📁 文件说明

| 文件/目录 | 作用 |
|-----------|------|
| `ISSUE_TEMPLATE/` | Issue 模板，开 Issue 时自动弹出模板选择器 |
| `pull_request_template.md` | PR 模板，开 PR 时自动填充 |
| `CONTRIBUTING.md` | 贡献指南，规定完整的开发流程与代码规范 |
| `SECURITY.md` | 安全漏洞报告政策 |
| `CODEOWNERS` | 代码审查责任人，PR 修改对应文件时自动邀请 Review |
| `labels.yml` | 标签体系定义（30+ 个分类标签） |
| `scripts/setup-labels.ps1` | 一键创建所有 GitHub Labels 的脚本 |

---

## 📋 Issue 模板

团队成员在 [新建 Issue](https://github.com/AIMFllys/StudySolo/issues/new/choose) 时，GitHub 会弹出以下模板选择：

| 模板 | 文件 | 适用场景 |
|------|------|---------|
| 🐛 Bug 报告 | `bug_report.md` | 发现代码缺陷或异常行为 |
| ✨ 功能需求 | `feature_request.md` | 提出新功能或改进建议 |
| 📋 任务/子任务 | `task.md` | 拆分开发任务、跟踪进度 |
| ♻️ 重构/技术债 | `refactor.md` | 代码重构或技术债务清理 |

---

## 🔀 PR 规范

每次提交 PR 时，GitHub 会自动加载 `pull_request_template.md` 模板，包含：

- **改动说明** — 做了什么、为什么做
- **关联 Issue** — `Closes #42` 自动闭环
- **改动类型** — feat / fix / refactor / docs 等
- **截图/演示** — UI 改动必须附图
- **自测清单** — 提交前的质量确认
- **破坏性变更** — 是否有 Breaking Change
- **Review 重点** — 告诉 Reviewer 看哪里

---

## 🏷️ 标签体系

项目使用 4 类标签进行分类管理：

### 类型标签（这是什么事？）
`bug` · `feature` · `enhancement` · `refactor` · `task` · `docs` · `test` · `security` · `discussion`

> ⚠️ `security` 标签不要在公开 Issue 中描述漏洞细节！请选择 Security Advisory 私密上报。

### 优先级标签（多紧急？）
`P0-critical` · `P1-important` · `P2-normal` · `P3-low`

### 模块标签（改的是哪里？）
`scope:frontend` · `scope:backend` · `scope:agent` · `scope:wiki` · `scope:engine` · `scope:admin` · `scope:auth` · `scope:database` · `scope:infra`

### 状态标签（进展如何？）
`status:todo` · `status:in-progress` · `status:blocked` · `status:needs-review` · `status:wontfix` · `status:duplicate`

**首次配置标签：**
```powershell
# 需要安装 GitHub CLI (gh) 并已登录
powershell -ExecutionPolicy Bypass -File ".github/scripts/setup-labels.ps1"
```

---

## 👥 CODEOWNERS

`CODEOWNERS` 文件定义了各目录的代码审查责任人。当 PR 修改了对应路径下的文件时，GitHub 会**自动邀请**责任人进行 Review。

当前配置（小李/小陈加入后需更新）：
- `*` 、`/backend/` 、`/frontend/` 、`/supabase/` 、`/docs/` ... → @AIMFllys（羽升）
- `/agents/` 、`/backend/config/agents.yaml` → @AIMFllys（小李加入后添加其 GitHub 用户名）
- `/frontend/src/app/(wiki)/` 、`/docs/wiki-content/` → @AIMFllys（小陈加入后添加）

> 随着团队扩大，小李和小陈的 GitHub 用户名确认后，在对应行去掉注释并添加即可。

---

## 🔒 分支保护（**必须配置**）

开启团队协作前，**必须**在 GitHub 仓库 **Settings → Branches** 中为 `main` 分支启用以下保护规则：

| 设置项 | 需启用 | 原因 |
|---------|:-------:|------|
| Require a pull request before merging | ✅ | 禁止直向 push |
| Required approvals: 1 | ✅ | PR 必须有人 Review |
| Require status checks to pass | ✅ | CI 检查必须通过 |
| Do not allow bypassing the above settings | ✅ | 连管理员也不能绕过 |
| Allow force pushes | ❌ | 禁止 Force Push |
| Allow deletions | ❌ | 禁止删除 main 分支 |

**操作路径：**
```
https://github.com/AIMFllys/StudySolo-Dev/settings/branches
→ Add branch protection rule
→ Branch name pattern: main
→ 按上表勾选
```

> ⚠️ 此配置加入小李或小陈参与前就应完成，否则仓库没有任何安全保障。

---

## 📖 参考资料

- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [GitHub Flow 工作流](https://docs.github.com/en/get-started/using-github/github-flow)
- [CODEOWNERS 文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Issue 模板配置](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
