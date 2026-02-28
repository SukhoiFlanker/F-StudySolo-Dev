# 📦 Git 同步脚本

三个 PowerShell 脚本，用于在 Monorepo 和 StudySolo 独立仓库之间同步代码。

## 脚本列表

| 脚本 | 方向 | 用途 |
|------|------|------|
| `sync-to-independent.ps1` | Monorepo → 独立仓库 | 将改动复制到独立仓库（不自动提交） |
| `sync-from-independent.ps1` | 独立仓库 → Monorepo | 拉取独立仓库的最新代码到 Monorepo |
| `sync-and-push.ps1` | Monorepo → 独立仓库 → GitHub | ⭐ **一键同步 + 提交 + 推送** |

## 使用方式

```powershell
# 在 Monorepo 根目录或任意位置执行

# 方式 1：最常用 — 一键推送
powershell -ExecutionPolicy Bypass -File "StudySolo\scripts\git\sync-and-push.ps1"

# 方式 2：带自定义提交消息
powershell -ExecutionPolicy Bypass -File "StudySolo\scripts\git\sync-and-push.ps1" -Message "feat: add new feature"

# 方式 3：只复制不提交
powershell -ExecutionPolicy Bypass -File "StudySolo\scripts\git\sync-to-independent.ps1"

# 方式 4：从独立仓库拉取
powershell -ExecutionPolicy Bypass -File "StudySolo\scripts\git\sync-from-independent.ps1"
```

## 自动排除的内容

| 排除项 | 原因 |
|--------|------|
| `.git/` | 各仓库有独立的 Git 历史 |
| `shared/` | 各自有独立的 Git Submodule |
| `node_modules/` | 应在目标重新安装 |
| `.next/` | Next.js 构建缓存 |
| `venv/` `.venv/` | Python 虚拟环境 |
| `__pycache__/` | Python 编译缓存 |
| `.kiro/` `.agent/` `.cursor/` `.Trae/` | AI 工具配置 |
| `.gitmodules` | 反向同步时排除（仅 `sync-from-independent`） |
