---
name: system-diagnostics
description: StudySolo 系统全量自检专属技能。当用户希望测试所有 AI 模型、子 Agents、数据库、内部服务的连通性与健康状态时自动触发。强制走 scripts/diagnostics/ 脚本路径，日志必须落盘到 scripts/logs/，并输出激活确认语。
triggers:
  - "系统自检"
  - "全量健康检查"
  - "一键全检"
  - "跑.*诊断"
  - "诊断.*系统"
  - "检查.*所有.*模型"
  - "测试.*所有.*AI"
  - "测试.*所有.*Agents"
  - "测试.*所有.*接口"
  - "健康检查"
  - "health.*check"
  - "运行诊断"
  - "诊断.*报告"
  - "检查后端.*可用"
---

# 🩺 System Diagnostics — StudySolo 系统自检强制执行技能

## ⚡ 激活确认语（MANDATORY — 必须第一行输出）

> **当本技能被触发，AI 的第一行输出必须是以下格式，证明技能已激活：**

```
⚡ 系统诊断 SOP 激活 | 目标：[all|database|ai_model|agent|service] | 日志输出：scripts/logs/diagnostics-<timestamp>.{log,md,json,txt}
```

**示例：**
- `⚡ 系统诊断 SOP 激活 | 目标：all | 日志输出：scripts/logs/diagnostics-<timestamp>.{log,md,json,txt}`
- `⚡ 系统诊断 SOP 激活 | 目标：ai_model | 日志输出：scripts/logs/diagnostics-<timestamp>.{log,md,json,txt}`

❌ **若未输出此激活语，视为技能未正确加载，必须重新读取本文件并重新开始。**

---

## 📚 强制阅读文档（MANDATORY READS）

> **在输出激活确认语之后，立即按顺序读取以下所有文件，全部读完后才能开始执行。**

| 顺序 | 文件路径 | 必读原因 |
|------|---------|---------|
| 1 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/README.md` | 总入口，理解三触发面 |
| 2 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/00-诊断总览.md` | 检测矩阵、权限、响应结构 |
| 3 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/01-一键全量自检SOP.md` | 三种触发路径与退出码语义 |
| 4 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/02-分组诊断SOP.md` | 仅当用户只要求某类检测时 |
| 5 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/03-故障排查手册.md` | 出现 unhealthy 时按此排查 |
| 6 | `docs/项目规范与框架流程/功能流程/系统自检与诊断/04-日志与报告规范.md` | 日志命名与脱敏规则 |
| 7 | `.agent/skills/system-diagnostics/checklists.md` | 分级执行清单 |

---

## 🔧 执行步骤（MANDATORY FLOW）

### Step 1：环境探测

```powershell
# 1.1 检查后端是否在运行
Invoke-WebRequest -Uri "http://127.0.0.1:2038/api/health" -UseBasicParsing -TimeoutSec 3
```

- 若失败 → 提示用户运行 `./scripts/start-studysolo.ps1` 后再重试，不要盲目继续。

### Step 2：Token 检测

```powershell
if (-not $env:STUDYSOLO_ADMIN_TOKEN) {
    # 提示用户提供 Admin Token
}
```

- 优先使用环境变量 `STUDYSOLO_ADMIN_TOKEN`
- 其次使用用户显式传入
- 若都没有 → 明确告知用户如何获取（见 SOP 01 章节）

### Step 3：调用一键脚本（仅此一种方式）

```powershell
.\scripts\diagnostics\run-diagnostics.ps1 -Category <目标> -Format all
```

**严格禁止**：
- ❌ 直接 `curl` 或 `Invoke-RestMethod` 调后端（日志不会落盘，违反 SOP）
- ❌ 修改后端代码来"绕过"权限（安全红线）
- ❌ 跳过日志落盘直接给用户口头结论

### Step 4：解析最新日志

```powershell
# 读取最新的 .md 报告
$latest = Get-ChildItem scripts\logs\diagnostics-*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-Content $latest.FullName -Encoding UTF8
```

### Step 5：汇报结果

结构化输出：

1. **摘要**：total / healthy / unhealthy / 耗时
2. **故障组件列表**（如有）：逐项列出 id、error、category
3. **建议动作**：对每个故障组件给出排查步骤（引用 SOP 03）
4. **日志路径**：明确告知三个报告文件的绝对路径

---

## 🚫 禁止事项

| 禁止 | 原因 |
|------|------|
| 不输出激活确认语 | Skill 未正确加载 |
| 不读取 SOP 直接执行 | 可能跳过脱敏、日志落盘、权限检查 |
| 不跑脚本凭猜测回答 | 结果不可审计，无日志证据 |
| 日志写到 `scripts/logs/` 之外 | 违反日志规范，git 会意外追踪 |
| 回答中泄露 admin token 值 | 安全红线 |
| 声称"已修复"但没跑回归 | 必须修复后再跑一次 `run-diagnostics.ps1` 确认 |

---

## ✅ 完成判定

只有当以下全部满足，才可认为本次诊断任务闭环：

- [ ] 已输出激活确认语
- [ ] 已读完强制文档
- [ ] 已调用 `run-diagnostics.ps1` 并拿到退出码
- [ ] `scripts/logs/` 下出现了新的 `diagnostics-*.{log,md,json,txt}`
- [ ] 已结构化汇报摘要 + 故障详情 + 排查建议
- [ ] 若存在 unhealthy，已引导用户按 SOP 03 排查

---

## 📎 快速参考

- 后端端点：`GET /api/admin/diagnostics/full`
- 脚本位置：`scripts/diagnostics/run-diagnostics.ps1`
- 日志目录：`scripts/logs/`
- Web UI：`/admin-analysis/diagnostics`
- 实现代码：`backend/app/api/admin_diagnostics.py`

