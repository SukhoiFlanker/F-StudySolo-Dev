# shared/ 子模块（Submodule）更新 SOP

> 最后更新：2026-04-11
> 文档编码：UTF-8（无 BOM） / LF
> 适用对象：StudySolo 团队所有成员（羽升 / 小李 / 小陈）

---

## 1. 背景

`StudySolo/` 仓库中的 `shared/` 目录是 Git **Submodule**，指向独立仓库 `AIMFllys/1037solo-shared`。

| 关系 | 说明 |
|------|------|
| `StudySolo/shared/` | Submodule，指针指向 `1037solo-shared` 的某个 commit |
| `AIMFllys/1037solo-shared` | 独立仓库，是共享代码的 **真正来源** |
| Platform Monorepo 中的 `StudySolo/` | Git subtree（与 submodule 是两个独立概念，不要混淆）|

> ⚠️ **修改 `shared/` 的内容，不等于修改 StudySolo 主仓**。必须先修改 `1037solo-shared` 仓库，再在主仓更新 submodule 指针。

---

## 2. 什么时候需要更新 shared/

以下情况需要走本 SOP：

- 新增 AI 模型相关的数据库表类型（如扩展 `ai_model_skus`）
- 更新 `shared/src/types/database.ts` 中的 TypeScript 类型定义
- 修改 `shared/docs/conventions/` 中的跨项目规范文档
- 修改 `shared/src/constants/` 中的跨项目常量

以下情况**不需要**走本 SOP（直接在 StudySolo 主仓改）：

- 修改 `shared/docs/guides/` 或 `shared/docs/decisions/`（文档类，允许在主仓侧直接改）
- StudySolo 自己的业务代码（前端 / 后端 / agents/）

---

## 3. 完整更新流程

### Step 1：在 `1037solo-shared` 仓库中进行修改

```bash
# 克隆共享仓库（如果本地没有）
git clone https://github.com/AIMFllys/1037solo-shared.git
cd 1037solo-shared

# 创建功能分支
git checkout -b feat/add-ai-sku-types

# 做修改，例如更新 database.ts
# ... 编辑 src/types/database.ts ...

# 提交
git add .
git commit -m "feat(types): add ai_model_skus new fields for dual-track routing"

# 推送并提 PR
git push origin feat/add-ai-sku-types
```

> 在 `1037solo-shared` 仓库提 PR，目标分支为 `main`。  
> **必须由羽升 Review 并合并**，因为共享层影响所有项目。

---

### Step 2：在 StudySolo 主仓更新 submodule 指针

PR 合并后，回到 StudySolo 主仓：

```bash
cd /path/to/StudySolo

# 进入 submodule 目录，拉取最新
cd shared
git fetch origin
git checkout main
git pull origin main

# 回到主仓，提交 submodule 指针更新
cd ..
git add shared
git commit -m "chore(deps): update shared submodule to latest (add AI SKU types)"
git push origin main
```

> **注意**：`git add shared` 提交的是 submodule 的指针（一个 commit hash），不是 shared/ 里的文件内容。

---

### Step 3：验证

```bash
# 验证 TypeScript 类型是否正确引入
cd frontend
pnpm tsc --noEmit

# 验证后端类型引用（如果后端也用了 shared/）
cd backend
python -c "from shared.src.types import database; print('OK')"
```

---

## 4. 常见错误与排查

### 4.1 修改了 shared/ 但 push 报错

**原因**：你在 `StudySolo/shared/` 里直接改了文件，但没有在 `1037solo-shared` 仓库提交。

```bash
# 查看 submodule 状态
git submodule status

# 如果显示 + 前缀，说明 submodule 有未提交的本地修改
# 应先放弃这些修改，走正规流程
cd shared
git checkout .
```

### 4.2 submodule 指针落后

```bash
# 更新到 1037solo-shared 的最新 main
cd shared
git pull origin main
cd ..
git add shared
git commit -m "chore(deps): update shared submodule"
```

### 4.3 clone 主仓后 shared/ 是空目录

```bash
# 初始化 submodule
git submodule update --init --recursive
```

---

## 5. 权限说明

| 操作 | 权限要求 |
|------|---------|
| 在 `1037solo-shared` 提 PR | 任何团队成员 |
| 合并 `1037solo-shared` 的 PR | 仅羽升 |
| 在 StudySolo 主仓更新 submodule 指针 | 任何团队成员，走 PR 流程 |

---

## 6. 参考

- [项目边界规范](../conventions/project-boundaries.md) — 了解 submodule vs subtree 的区别
- [数据库规范](../conventions/database.md) — 修改 DB 相关类型前必读
- [StudySolo Subtree 同步指南](subtree-sync.md) — Platform Monorepo 的同步流程（与本文档无关）
