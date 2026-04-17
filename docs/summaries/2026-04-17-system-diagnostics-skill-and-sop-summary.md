# 系统自检 Skill + SOP + 一键脚本实现摘要

**日期**：2026-04-17
**完成状态**：✅ 已完成
**相关更新**：`docs/updates/2026-04-17-system-diagnostics-skill-and-sop.md`

---

## 一句话总结

把 2026-04-16 的管理后台诊断端点升级为**三触发面统一体系**（AI Skill / 命令行 / Web UI），共用后端 `/api/admin/diagnostics/full`，日志统一落盘到 `scripts/logs/`。

---

## 设计要点

### 1. 为什么需要三触发面

| 触发面 | 典型用户 | 场景 |
|--------|----------|------|
| AI Skill | 开发中 AI 助手 | "帮我检查系统是否正常" |
| 命令行脚本 | 开发者 / CI | 本地验证 / 自动化门禁 |
| Web UI | 生产运维管理员 | 可视化巡检 |

三条路径最终都走同一后端端点，保证数据口径一致。

### 2. 日志落盘统一规范

所有诊断产物落在 `scripts/logs/`：

```text
diagnostics-YYYYMMDD-HHmmss.log    ← 执行日志
diagnostics-YYYYMMDD-HHmmss.md     ← Markdown 报告
diagnostics-YYYYMMDD-HHmmss.json   ← 机器可读
diagnostics-YYYYMMDD-HHmmss.txt    ← 纯文本
```

目录已 `.gitignore`，避免误提交。

### 3. 退出码语义

```
0 → 全部 healthy
1 → 有 unhealthy（业务异常）
2 → 脚本异常（后端未启动 / Token 失效 / 网络错误）
```

CI 可直接 `if diagnostics.exit_code != 0: fail`。

### 4. UTF-8 BOM 策略

| 类型 | 编码 |
|------|------|
| `.ps1` | **UTF-8 with BOM**（用户强制要求） |
| `.sh` | UTF-8 无 BOM |
| `.py` | UTF-8 无 BOM |
| `.md` | UTF-8 无 BOM |
| 日志 | UTF-8 无 BOM |

原因：Windows PowerShell 5.1 无 BOM 时按 GBK 解析中文会乱码，加 BOM 可兼容两个 PS 版本。

---

## 文件变更清单

### 新建（14 个）

**SOP（5）**：
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/README.md`
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/00-诊断总览.md`
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/01-一键全量自检SOP.md`
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/02-分组诊断SOP.md`
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/03-故障排查手册.md`
- `docs/项目规范与框架流程/功能流程/系统自检与诊断/04-日志与报告规范.md`

**AI Skill（3）**：
- `.agent/skills/system-diagnostics/SKILL.md`
- `.agent/skills/system-diagnostics/checklists.md`
- `.agent/skills/system-diagnostics/scripts/run_diagnostics.py`

**Scripts（4）**：
- `scripts/diagnostics/run-diagnostics.ps1`（UTF-8 BOM）
- `scripts/diagnostics/run-diagnostics.sh`
- `scripts/diagnostics/run_diagnostics.py`
- `scripts/diagnostics/README.md`

**更新与摘要（2）**：
- `docs/updates/2026-04-17-system-diagnostics-skill-and-sop.md`
- `docs/summaries/2026-04-17-system-diagnostics-skill-and-sop-summary.md`

### 修改（2 个）

- `README.md`：文档导航 + AI Skills 表格补入口（4 个 skills）
- `scripts/README.md`：目录树 + 新增「系统诊断」章节

---

## Skill 触发词设计

```yaml
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
```

触发后 AI 必须：
1. 输出激活确认语
2. 读完 7 份强制文档
3. 走 `scripts/diagnostics/run-diagnostics.ps1`（禁止绕过）
4. 解析 `scripts/logs/` 最新产物
5. 结构化汇报

---

## 验收状态

- [x] `run-diagnostics.ps1` 为 UTF-8 with BOM（首字节 `EF BB BF` 已验证）
- [x] 5 份 SOP 文档齐全
- [x] Skill 含 SKILL.md + checklists.md + Python 脚本
- [x] 根 README 补入口（skills 4 个、文档导航 1 个）
- [x] scripts/README 补目录树和使用章节
- [ ] 实机运行脚本（需后端 + Admin Token，留给用户验证）

---

## 后续可选增强

| 项目 | 价值 |
|------|------|
| 后端原生 `?category=&format=` 查询参数 | 减少客户端过滤负担 |
| `scripts/logs/` 30 天自动清理 Scheduled Task | 避免膨胀 |
| 诊断失败 → 飞书/钉钉告警 | 生产巡检闭环 |
| 导出 PDF 报告 | 合规审计友好 |
| 诊断历史趋势图（Web UI） | 观察劣化模型 |

