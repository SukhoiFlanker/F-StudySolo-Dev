<!-- 编码：UTF-8 -->

# scripts/diagnostics/ — 系统一键诊断

> 最后更新：2026-04-17

一键调用管理后台 `/api/admin/diagnostics/full`，测试所有 AI 模型 / 子 Agents / 数据库 / 内部服务，并将日志与多格式报告落盘到 `scripts/logs/`。

---

## 文件清单

| 文件 | 平台 | 编码 | 说明 |
|------|------|------|------|
| `run-diagnostics.ps1` | Windows | UTF-8 **with BOM** | 主推脚本，彩色终端 + 完整日志 |
| `run-diagnostics.sh` | Linux/macOS | UTF-8 无 BOM | 镜像实现，需 `jq` 获得最佳体验 |
| `run_diagnostics.py` | 跨平台 | UTF-8 无 BOM | 委托 `.agent/skills/system-diagnostics/scripts/run_diagnostics.py` |
| `README.md` | — | UTF-8 | ← 你在这里 |

---

## 快速开始

### Windows

```powershell
# 1. 先启动后端
.\scripts\start-studysolo.ps1

# 2. 设置 Admin Token（浏览器 DevTools 复制 admin_token cookie）
$env:STUDYSOLO_ADMIN_TOKEN = "eyJhbGc..."

# 3. 一键全检
.\scripts\diagnostics\run-diagnostics.ps1
```

### Linux / macOS

```bash
export STUDYSOLO_ADMIN_TOKEN="eyJhbGc..."
bash scripts/diagnostics/run-diagnostics.sh
```

### CI / Python 环境

```bash
pip install httpx
python scripts/diagnostics/run_diagnostics.py --admin-token "$TOKEN"
```

---

## 参数（PowerShell）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `-BaseUrl` | `http://127.0.0.1:2038` | 后端地址 |
| `-AdminToken` | `$env:STUDYSOLO_ADMIN_TOKEN` | 管理员 JWT |
| `-Category` | `all` | 过滤类别：`all`/`database`/`ai_model`/`agent`/`service` |
| `-Format` | `all` | 报告格式：`all`/`markdown`/`json`/`text` |
| `-OutputDir` | `scripts/logs` | 日志输出目录 |

## 输出

每次运行产出 4 个文件：

```text
scripts/logs/
├── diagnostics-20260417-104732.log   # 主日志
├── diagnostics-20260417-104732.md    # Markdown 报告
├── diagnostics-20260417-104732.json  # JSON 报告
└── diagnostics-20260417-104732.txt   # 纯文本报告
```

## 退出码

| 值 | 含义 |
|----|------|
| 0 | 所有组件 healthy |
| 1 | 存在 unhealthy 组件 |
| 2 | 脚本异常（后端未启动 / Token 失效 / 网络错误） |

CI 可直接把退出码当健康门禁。

---

## 相关文档

- [系统自检 SOP 总入口](../../docs/项目规范与框架流程/功能流程/系统自检与诊断/README.md)
- [一键全量自检 SOP](../../docs/项目规范与框架流程/功能流程/系统自检与诊断/01-一键全量自检SOP.md)
- [故障排查手册](../../docs/项目规范与框架流程/功能流程/系统自检与诊断/03-故障排查手册.md)
- [AI Skill](../../.agent/skills/system-diagnostics/SKILL.md)

---

## 编码说明

PowerShell 脚本必须 **UTF-8 with BOM**，原因：

- Windows PowerShell 5.1 无 BOM 时按 GBK 解析，中文会乱码
- PS 7+ 虽默认 UTF-8，但加 BOM 可同时兼容两版本

验证：

```powershell
$bytes = [System.IO.File]::ReadAllBytes("scripts\diagnostics\run-diagnostics.ps1")
"{0:X2} {1:X2} {2:X2}" -f $bytes[0], $bytes[1], $bytes[2]
# 期望输出: EF BB BF
```
