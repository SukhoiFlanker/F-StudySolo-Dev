# 2026-04-17 更新日志（系统自检 Skill + SOP + 一键脚本）

## 1. 背景

昨日（2026-04-16）新增管理后台 **系统诊断面板** 后，诊断能力仅能通过 Web UI 触发。本次将其扩展为 **三触发面** 统一体系：

- AI 自动触发（Skill）
- 命令行手动触发（`scripts/diagnostics/`）
- 管理员 Web UI（沿用 `/admin-analysis/diagnostics`）

三者共用后端 `GET /api/admin/diagnostics/full`，日志统一落盘到 `scripts/logs/`。

## 2. 新增文件

### 2.1 SOP 文档（`docs/项目规范与框架流程/功能流程/系统自检与诊断/`）

| 文件 | 内容 |
|------|------|
| `README.md` | 总入口：三触发面与使用场景 |
| `00-诊断总览.md` | 检测矩阵、权限、响应结构、退出码 |
| `01-一键全量自检SOP.md` | PowerShell / Web UI / AI 三条路径 |
| `02-分组诊断SOP.md` | 仅检测某类组件的方式 |
| `03-故障排查手册.md` | 常见错误现象 → 定位 → 修复 |
| `04-日志与报告规范.md` | 命名、保留、脱敏、编码规则 |

### 2.2 AI Skill（`.agent/skills/system-diagnostics/`）

| 文件 | 内容 |
|------|------|
| `SKILL.md` | 触发词、激活确认语、强制阅读文档、执行流 |
| `checklists.md` | Level 1/2/3 + 安全检查 + 汇报模板 |
| `scripts/run_diagnostics.py` | 纯 Python 备用 CLI |

**触发词覆盖**："系统自检"、"全量健康检查"、"一键全检"、"跑诊断"、"检查所有模型"、"测试所有 Agents" 等。

**激活确认语（强制第一行输出）**：
```
⚡ 系统诊断 SOP 激活 | 目标：[all|database|ai_model|agent|service] | 日志输出：scripts/logs/diagnostics-<timestamp>.{log,md,json,txt}
```

### 2.3 诊断脚本（`scripts/diagnostics/`）

| 文件 | 平台 | 编码 | 说明 |
|------|------|------|------|
| `run-diagnostics.ps1` | Windows | **UTF-8 with BOM** | 主推脚本，彩色终端 + 完整日志 |
| `run-diagnostics.sh` | Linux/macOS | UTF-8 无 BOM | 镜像实现，需 `jq` |
| `run_diagnostics.py` | 跨平台 | UTF-8 无 BOM | 委托 Skill 的 Python 实现 |
| `README.md` | — | UTF-8 | 用法 + 参数 + BOM 验证 |

**关键设计**：
- 退出码 `0=全健康 / 1=有故障 / 2=脚本异常`（CI 友好）
- 每次运行产出 4 个文件：`.log / .md / .json / .txt`
- 所有日志统一落盘到 `scripts/logs/`（已 `.gitignore`）
- 支持 `-Category` 过滤 + `-Format` 选择报告格式
- Admin Token 支持 `$env:STUDYSOLO_ADMIN_TOKEN` 或 `-AdminToken` 参数

### 2.4 汇总文档

- `docs/summaries/2026-04-17-system-diagnostics-skill-and-sop-summary.md`

## 3. 修改文件

### 3.1 根 `README.md`

- **文档导航**：新增「系统自检与诊断 SOP」入口
- **AI 开发技能**：skills 数量从 3 → 4，新增 `system-diagnostics` 条目

### 3.2 `scripts/README.md`

- 目录结构补 `diagnostics/` 子目录
- 新增「系统诊断」章节

## 4. UTF-8 BOM 设计决策

根据用户明确要求，`run-diagnostics.ps1` 使用 **UTF-8 with BOM**：

- Windows PowerShell 5.1 无 BOM 时按 GBK 解析，中文会乱码
- PS 7+ 虽默认 UTF-8，但加 BOM 可同时兼容两版本
- 写入方式：`[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($true))`
- 验证：首 3 字节 `EF BB BF`

其他文件（`.sh` / `.py` / `.md`）仍然 UTF-8 无 BOM + LF，符合项目规范。

## 5. 交付清单

| 类别 | 数量 |
|------|------|
| 新增 SOP 文档 | 5 |
| 新增 AI Skill 文件 | 3 |
| 新增诊断脚本 | 4 |
| 修改现有文档 | 2（根 README、scripts/README） |
| 新增更新 + 摘要 | 2 |

**总计**：14 新建 / 2 修改

## 6. 后续建议

- [ ] 可选：后端 `/api/admin/diagnostics/full?category=...` 原生过滤
- [ ] 可选：日志 30 天自动清理 Scheduled Task
- [ ] 可选：诊断失败时自动发送飞书/钉钉告警
- [ ] 可选：导出 PDF 报告

