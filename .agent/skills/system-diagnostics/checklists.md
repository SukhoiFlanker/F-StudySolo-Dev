# System Diagnostics — 分级执行清单

## 🟢 Level 1：常规自检（一键全量）

触发场景："跑一下系统自检"、"全量健康检查"

- [ ] 输出激活确认语
- [ ] 读完 7 份强制文档
- [ ] 后端 `/api/health` 探测通过
- [ ] Admin Token 已配置
- [ ] 执行 `.\scripts\diagnostics\run-diagnostics.ps1`
- [ ] `scripts/logs/` 出现 4 份新文件（.log/.md/.json/.txt）
- [ ] 结构化汇报摘要 + 路径

## 🟡 Level 2：分组诊断

触发场景："只测 AI 模型"、"检查所有 Agents"

- [ ] 确认 `-Category` 参数（database/ai_model/agent/service）
- [ ] 执行带参脚本
- [ ] 汇报时明确说明只覆盖该类别
- [ ] 如需跨类诊断，建议用户跑一次 `-Category all`

## 🔴 Level 3：故障复现 + 修复回归

触发场景：用户反馈"某模型挂了" / 上次自检有 unhealthy

- [ ] 首先查最新 `scripts/logs/diagnostics-*.md`，理解上下文
- [ ] 按 SOP 03 《故障排查手册》逐项定位
- [ ] 若需要修改配置/代码，明确告知修改范围
- [ ] 修复后**必须**重新跑一次对应类别的诊断
- [ ] 退出码 0 才可声明"修复完成"
- [ ] 生成新的 unique timestamp 日志作为修复证据

## 🛡️ 通用安全检查（每次必做）

- [ ] 日志中不出现 Admin Token 明文
- [ ] 不在对话中回显 API Key
- [ ] 不提议"临时关闭认证"绕过问题
- [ ] 不删除历史日志（用户要求除外）
- [ ] 修改后端代码前先征求确认

## 🧾 汇报模板

```markdown
## 系统诊断结果

**执行时间**：2026-04-17 10:47:32
**目标**：all
**耗时**：6234ms
**结果**：14 healthy / 1 unhealthy / 15 total

### ❌ 故障组件

1. **ai-zhipu-glm-4-plus** (ai_model)
   - Error: Connection timeout after 10000ms
   - 建议：检查网络代理 / 验证 `ZHIPU_API_KEY` / 查看 Provider 状态页

### 📂 日志文件

- 主日志：`scripts/logs/diagnostics-20260417-104732.log`
- Markdown 报告：`scripts/logs/diagnostics-20260417-104732.md`
- JSON 报告：`scripts/logs/diagnostics-20260417-104732.json`
- 纯文本：`scripts/logs/diagnostics-20260417-104732.txt`

### 🔄 下一步

建议按 SOP 03 排查 `ai-zhipu-glm-4-plus` 后重新跑：
`.\scripts\diagnostics\run-diagnostics.ps1 -Category ai_model`
```

