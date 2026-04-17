# 01 — 一键全量自检 SOP

## 路径 A：PowerShell 脚本（推荐本地 / CI）

### 前置条件

1. 后端已启动（`./scripts/start-studysolo.ps1`）
2. 已获取管理员 token（见下方「获取 Token」章节）

### 一键执行

```powershell
# 最简用法（需提前设置环境变量）
$env:STUDYSOLO_ADMIN_TOKEN = "<your-admin-jwt>"
.\scripts\diagnostics\run-diagnostics.ps1

# 或直接传参
.\scripts\diagnostics\run-diagnostics.ps1 -AdminToken "<your-admin-jwt>"

# 指定后端地址（默认 http://127.0.0.1:2038）
.\scripts\diagnostics\run-diagnostics.ps1 -BaseUrl "https://studyflow.1037solo.com"
```

### 输出

脚本会在 `scripts/logs/` 生成：

- `diagnostics-20260417-104732.log` — 执行日志 + 摘要
- `diagnostics-20260417-104732.md` — 完整 Markdown 报告
- `diagnostics-20260417-104732.json` — 机器可读 JSON
- `diagnostics-20260417-104732.txt` — 纯文本报告

控制台会打印彩色摘要 + 日志路径。

### 退出码

| 值 | 含义 |
|----|------|
| 0 | 全部组件 healthy |
| 1 | 有组件 unhealthy（读 `.md` 报告看详情） |
| 2 | 脚本异常（后端未启动 / Token 失效 / 网络错误） |

---

## 路径 B：Web UI（管理员可视化）

1. 登录管理后台 `/admin-analysis/login`
2. 左侧边栏 → 系统 → 系统诊断
3. 点击右上角「运行全检」按钮
4. 等待约 15 秒，查看结果
5. 底部选择报告格式一键复制 / 下载

---

## 路径 C：AI 自动触发（开发期辅助排查）

对 AI 说：

- "帮我跑一下系统自检"
- "检查所有 AI 模型是否可用"
- "测试所有 Agents 和数据库"

AI 会：

1. 输出激活确认语：`⚡ 系统诊断 SOP 激活 | ...`
2. 读取本 SOP 与 Skill 文件
3. 调用 `scripts/diagnostics/run-diagnostics.ps1`
4. 解析 `scripts/logs/` 最新日志，汇报结果与排查建议

---

## 获取 Admin Token

### 方式 1：从浏览器 Cookie 复制

1. 浏览器登录 `/admin-analysis/login`
2. 打开 DevTools → Application → Cookies → `admin_token`
3. 复制值

### 方式 2：通过登录 API

```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:2038/api/admin/auth/login" `
    -Method POST `
    -Body (@{ username = "admin"; password = "<password>" } | ConvertTo-Json) `
    -ContentType "application/json"
$env:STUDYSOLO_ADMIN_TOKEN = $response.access_token
```

---

## 耗时参考

- 数据库检测：~10-50ms
- 单个 AI 模型：~200-2000ms
- 单个 Agent：~50-500ms
- 总耗时（17 模型 + 5 Agents + 1 DB + 1 Service）：约 3-10s

超过 20s 未完成，脚本会打印进度提示；超过 60s 自动超时退出（退出码 2）。

