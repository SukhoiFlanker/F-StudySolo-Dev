# 02 — 分组诊断 SOP

当只想检测某一类组件时使用（v1 在客户端过滤，v2 后端可能原生支持 `?category=...`）。

## 仅检测数据库

```powershell
.\scripts\diagnostics\run-diagnostics.ps1 -Category database
```

**用途**：Supabase 连接池异常、迁移后验证、网络波动排查。

## 仅检测 AI 模型

```powershell
.\scripts\diagnostics\run-diagnostics.ps1 -Category ai_model
```

**用途**：
- 某 Provider Key 轮换后验证
- 新模型上架后冒烟测试
- 某平台宕机时快速确认影响范围

## 仅检测 Agents

```powershell
.\scripts\diagnostics\run-diagnostics.ps1 -Category agent
```

**用途**：
- Agent 服务重启后验证
- 新 Agent 注册后验证 Gateway 对接
- `agents.yaml` 修改后回归

## 仅检测内部服务

```powershell
.\scripts\diagnostics\run-diagnostics.ps1 -Category service
```

**用途**：Embedding / 搜索服务可用性验证。

---

## 组合使用

脚本内部实际仍然调用 `/api/admin/diagnostics/full`，然后在本地做过滤与报告重组。这样保证：

1. 后端只维护一个端点
2. 客户端可以自由组合维度
3. 完整日志永远包含全部组件（便于交叉诊断）

---

## 报告格式选择

```powershell
# 默认输出全部 3 种格式 + .log 主日志
.\scripts\diagnostics\run-diagnostics.ps1

# 只要 JSON（CI 解析用）
.\scripts\diagnostics\run-diagnostics.ps1 -Format json

# 只要 Markdown（粘贴到 PR / Issue）
.\scripts\diagnostics\run-diagnostics.ps1 -Format markdown

# 全部格式
.\scripts\diagnostics\run-diagnostics.ps1 -Format all
```

