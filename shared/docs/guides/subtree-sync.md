<!-- 编码：UTF-8 -->

# 🔄 项目同步工作流指南

> **定位**：指导如何在 Platform Monorepo 和 StudySolo 独立仓库之间正确同步代码  
> **最后更新**：2026-02-28

---

## 仓库结构概览

```
GitHub:
├── AIMFllys/1037Solo          ← Platform Monorepo（包含 StudySolo/ subtree）
└── AIMFllys/StudySolo         ← StudySolo 独立仓库（日常开发）

本地:
├── d:\project\1037solo\platform.1037solo.com\   ← Platform 本地仓库
│   ├── home/
│   ├── StudySolo/                                ← Subtree（只读，通过 pull 同步）
│   └── ...
└── d:\project\Study_1037Solo\StudySolo\          ← StudySolo 本地仓库（日常开发）
```

---

## 日常工作流

### 场景 1：StudySolo 日常开发

```bash
# 在 StudySolo 独立仓库中工作
cd d:\project\Study_1037Solo\StudySolo

# 正常开发、提交、推送
git add .
git commit -m "feat: ..."
git push origin main

# ✅ 提交到 AIMFllys/StudySolo
# ❌ 不会影响 AIMFllys/1037Solo
```

### 场景 2：Platform 同步 StudySolo 最新代码

```bash
# 在 Platform Monorepo 中执行
cd d:\project\1037solo\platform.1037solo.com

# 确保工作区干净
git status  # 应该没有未提交的更改

# 拉取 StudySolo 最新代码
git subtree pull --prefix=StudySolo https://github.com/AIMFllys/StudySolo.git main --squash

# 推送到 Platform 仓库
git push origin main

# ✅ Platform 仓库中的 StudySolo/ 更新到最新
```

### 场景 3：Platform 整体提交（包含非 StudySolo 的更改）

```bash
# 在 Platform 仓库中
cd d:\project\1037solo\platform.1037solo.com

# 正常开发 home/、docs/ 等目录
git add .
git commit -m "feat: ..."
git push origin main

# ✅ 所有更改（包括 StudySolo/ 子目录）一起提交到 AIMFllys/1037Solo
```

### 场景 4：在 Platform 中修改了 StudySolo/ 的文件，需要推回

```bash
# ⚠️ 尽量避免这种情况，应该在 StudySolo 独立仓库中开发

# 如果确实需要，可以在 Platform 仓库中执行：
cd d:\project\1037solo\platform.1037solo.com
git subtree push --prefix=StudySolo https://github.com/AIMFllys/StudySolo.git main
```

---

## 同步频率建议

| 触发条件 | 操作 |
|---------|------|
| StudySolo 完成一个里程碑 | 在 Platform 中 `subtree pull` |
| 准备发布 Platform 整体版本 | 先 `subtree pull` 确保最新 |
| 修改了共享数据库规范 | 两边都要更新对应文档 |
| 每周定期 | 建议至少每周同步一次 |

---

## 常见问题

### Q: subtree pull 时有冲突怎么办？

```bash
# 通常是因为在 Platform 侧直接修改了 StudySolo/ 的文件
# 解决方法：像普通 merge conflict 一样手动解决
git mergetool
# 或手动编辑冲突文件，然后
git add .
git commit
```

### Q: 能不能用 subtree 的简写命令？

可以添加 remote 简化命令：

```bash
# 添加 StudySolo 作为 remote（只需执行一次）
git remote add studysolo https://github.com/AIMFllys/StudySolo.git

# 之后可以简写为
git subtree pull --prefix=StudySolo studysolo main --squash
git subtree push --prefix=StudySolo studysolo main
```

### Q: StudySolo/ 目录下有 .git 吗？

没有。Git Subtree 模式下，`StudySolo/` 只是普通目录，只有 Platform 根目录有一个 `.git`。

---

*维护者：1037Solo Development Team · 最后更新：2026-02-28*
