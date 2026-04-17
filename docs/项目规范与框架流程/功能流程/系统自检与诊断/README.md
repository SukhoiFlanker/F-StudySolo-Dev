# 系统自检与诊断 SOP

> 适用范围：主后端 API / AI 模型 / 子 Agents / 内部服务 / 数据库连通性的全量与分组健康检测
> 最后更新：2026-04-17
> 编码要求：UTF-8 无 BOM + LF（PowerShell 脚本除外，脚本必须 UTF-8 with BOM）

---

## 一句话概览

StudySolo 的"系统自检"是一套**三触发面**的健康检查工具：AI 自动跑（Skill）/ 命令行手动跑（`scripts/diagnostics/`）/ Web UI 管理员面板（`/admin-analysis/diagnostics`），共用同一套检测矩阵，日志统一落盘 `scripts/logs/`。

---

## 文档索引

| 编号 | 文件 | 用途 |
|------|------|------|
| 00 | [`00-诊断总览.md`](./00-诊断总览.md) | 检测矩阵、权限、架构、日志约定 |
| 01 | [`01-一键全量自检SOP.md`](./01-一键全量自检SOP.md) | PowerShell / 浏览器 / AI 三种触发路径 |
| 02 | [`02-分组诊断SOP.md`](./02-分组诊断SOP.md) | 单独检测某类组件 |
| 03 | [`03-故障排查手册.md`](./03-故障排查手册.md) | 常见错误 → 定位 → 修复 |
| 04 | [`04-日志与报告规范.md`](./04-日志与报告规范.md) | 日志命名、保留策略、格式约定 |

---

## 使用场景

| 场景 | 推荐路径 |
|------|----------|
| 本地开发启动后快速验证依赖 | `./scripts/diagnostics/run-diagnostics.ps1` |
| 生产部署后巡检 | Web UI `/admin-analysis/diagnostics` |
| AI 帮忙排查"为什么某个模型挂了" | 对 AI 说"跑系统自检"触发 Skill |
| CI/CD 管道健康门禁 | `run-diagnostics.ps1 -Category all`（退出码 0/1） |
| 故障复现 + 证据收集 | 脚本会自动落盘 `.md/.json/.log` 三份报告 |

---

## 相关资源

- 后端端点：`GET /api/admin/diagnostics/full`
- 前端页面：`/admin-analysis/diagnostics`
- AI Skill：`.agent/skills/system-diagnostics/SKILL.md`
- 日志目录：`scripts/logs/`（已 `.gitignore`）
- 实现代码：`backend/app/api/admin_diagnostics.py`

