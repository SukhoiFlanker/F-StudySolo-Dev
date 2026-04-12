# Phase 5: 平台集成 + 根级治理 + Wiki

> 预估时间：10-15 天
> 前置依赖：Phase 2 + Phase 3 完成，且 Phase 4 已具备至少 1 个可调用子后端
> 负责人：全体（分模块）

---

## 目标

**整合所有重构产出**——实现 Agent Gateway、Wiki 子项目、根级治理工具，完成从"分散治理"到"平台化协作"的质变。

---

## 当前起点（2026-04-12）

- Phase 2 后端重构已完成，主后端目录与 API 分组已稳定
- Phase 3 前端重构已完成，工程主线已切到 `features/` / `services/` / `stores/` 新结构
- Phase 4A 节点系统主线已完成，仅剩 `workflow-meta.ts` 的 deprecate 长尾
- Phase 4B 在当前 owner 侧已经收口到 `code-review-agent`：现有 `code-review-agent` 已具备 `GET /health`、`GET /health/ready`、`GET /v1/models`、`POST /v1/chat/completions`、non-stream / SSE、真实 upstream seam，以及 `177 passed` 的测试基线
- 当前 owner 的默认下一主线不再是继续深挖 `code-review-agent` 的 4B 细节，而是直接进入 Phase 5 的平台集成、治理、文档对齐与 CI 增强
- 子 Agent 扩展、其他 Agent 迁移与骨架补全不属于当前 owner lane；这部分由小李或其他 lane 并行推进，不应阻塞 Phase 5.1 Gateway 启动

## 建议执行顺序

1. **Task 5.1 Agent Gateway**
   - 以当前 `code-review-agent` 作为首个接入目标，先把注册、调用、健康检查、SSE 透传、超时链和审计主线跑通
2. **Task 5.3 根级 Monorepo 治理**
   - 补 `CODEOWNERS`、治理文档、ownership 划分，减少 Phase 5 并行推进时的边界歧义
3. **Task 5.4 文档与代码对齐**
   - 先同步 `README` / `ARCHITECTURE` / `project-context` / 旧路径引用，保证后续 Claude 或其他 agent 的上下文一致
4. **Task 5.5 CI/CD 增强**
   - 在治理边界明确后补路径触发与依赖方向检查，避免对正在进行的实现造成误伤
5. **Task 5.2 Wiki**
   - 由小陈并行推进；当前 owner 主要负责保证 `docs/wiki-content/` 与整体重构事实对齐

---

## Task 5.1：Agent Gateway 实现

> [!NOTE]
> **当前起点已经具备**：`code-review-agent` 是一个已通过契约测试、具备 non-stream / SSE、并且经过 Phase 4B 治理收口的真实子后端，可直接作为 Gateway 的第一个接入对象；这一阶段不需要等待更多 Agent 骨架或新的 4B 深挖。

### 后端 Gateway 层

```
backend/app/services/agent_gateway/
├── __init__.py
├── gateway.py            # AgentGateway 主类
├── registry.py           # AgentRegistry（从 config.yaml 加载）
├── caller.py             # 子后端 HTTP 调用
├── health.py             # 健康检查 + 熔断器
└── models.py             # AgentMeta, AgentCallRequest 等
```

**核心实现**：

```python
class AgentGateway:
    """主后端的统一子后端接入层"""
    
    def __init__(self, config: dict):
        self.registry = AgentRegistry(config.get("agents", {}))
        self.caller = AgentCaller()
    
    async def discover(self) -> list[AgentMeta]:
        """返回所有已注册且健康的 Agent"""
        agents = self.registry.list_all()
        healthy = []
        for agent in agents:
            if await self.health_check(agent.name):
                healthy.append(agent)
        return healthy
    
    async def call(self, agent_name: str, messages: list, stream: bool = False):
        """统一调用入口：认证 → 限流 → 调用 → 审计"""
        agent = self.registry.get(agent_name)
        if not agent:
            raise AgentNotFoundError(agent_name)
        
        # 平台治理层
        request_id = str(uuid.uuid4())
        headers = {"X-Request-Id": request_id}
        
        result = await self.caller.call(
            url=f"{agent.url}/v1/chat/completions",
            messages=messages,
            stream=stream,
            timeout=agent.timeout,
            headers=headers,
        )
        
        # 审计
        await self._audit_call(agent_name, request_id, result)
        return result
```

### 前端 Agent API

```
POST /api/agents                     → 列出所有可用 Agent
POST /api/agents/{name}/chat         → 调用 Agent（代理模式）
GET  /api/agents/{name}/health       → 查询 Agent 健康状态
```

### AI 编程易出问题的点

> [!WARNING]
> 1. **熔断器状态管理**：`pybreaker` 的状态是进程内的，如果使用多 worker 部署，每个 worker 独立熔断
> 2. **流式代理**：Gateway 需要支持 SSE 透传，不能把流式响应 buffer 成一整个响应再转发
> 3. **超时链**：Gateway timeout > Sub-backend timeout > AI Provider timeout，否则会出现 Gateway 先超时但子后端还在运行
> 4. **Config hot-reload**：`config.yaml` 修改后是否需要重启？建议启动时加载一次

---

## Task 5.2：Wiki 子项目初始化（小陈）

> 📄 **详细计划已独立**：[wiki-init-plan.md](wiki-init-plan.md)（Tasks W1-W6 完整实施方案）
> 
> ⚠️ **方案变更**：原 `wiki/` 独立子项目方案（端口 2039）已废弃，改为 Next.js Route Group 嵌入主前端。
> 详见 [`wiki/README.md`](../../../../wiki/README.md)

**采用方案 A：Next.js Route Group**

```
frontend/src/app/(wiki)/
├── wiki/
│   ├── page.tsx                   # Wiki 首页
│   ├── layout.tsx                 # Wiki 专属布局（不同于主应用）
│   └── [...slug]/
│       └── page.tsx               # 动态文档页
```

### Wiki 内容目录

```
docs/wiki-content/                  # 设计源（在主仓）
├── getting-started/
│   ├── quick-start.md
│   └── concepts.md
├── guides/
│   ├── creating-workflows.md
│   └── using-nodes.md
└── api/
    └── reference.md
```

### Wiki 发布流程

```
主仓 docs/wiki-content/  →  CI 自动发布  →  Wiki 页面
       (设计源)                              (发布源)
```

### Wiki 布局组件

```
frontend/src/components/wiki/
├── WikiSidebar.tsx               # 文档导航
├── WikiSearch.tsx                # 搜索
├── WikiTOC.tsx                   # 右侧目录
└── WikiMDXComponents.tsx         # MDX 自定义组件
```

### 小陈 的 Checklist

- [ ] 创建 `(wiki)` 路由组
- [ ] 实现 Wiki 专属布局（与主应用不同的 sidebar）
- [ ] 实现 Markdown 渲染
- [ ] 编写至少 3 篇初始文档（快速开始、创建工作流、节点使用）
- [ ] 实现文档搜索功能

### AI 编程易出问题的点

> [!WARNING]
> 1. **Route Group 嵌套**：`(wiki)` 不出现在 URL 中，实际访问路径是 `/wiki/...`
> 2. **Layout 隔离**：Wiki 的 layout.tsx 不要继承主应用的 sidebar 布局
> 3. **MDX vs Markdown**：如果只用纯 Markdown，不需要 MDX 依赖，减少复杂度
> 4. **Static Build**：Wiki 内容适合使用 `generateStaticParams` 静态生成

---

## Task 5.3：根级 Monorepo 治理

### 5.3.1 建立根级质量门禁文档

```
docs/team/refactor/governance/
├── import-rules.md               # 禁止跨层 import 规则
├── pr-checklist.md               # PR 必须满足的条件
├── module-ownership.md           # 模块 Owner 分配
└── ci-pipeline.md                # CI 流程说明
```

### 5.3.2 CODEOWNERS 按模块拆分

```
# .github/CODEOWNERS（升级版）
# 核心引擎 - 羽升
backend/app/engine/        @AIMFllys
backend/app/nodes/         @AIMFllys

# 子后端 Agent - 小李（TODO: 添加其 GitHub 用户名）
/agents/                   @AIMFllys
/backend/config/agents.yaml @AIMFllys

# Wiki - 小陈（TODO: 添加其 GitHub 用户名）
frontend/src/app/(wiki)/   @AIMFllys
docs/wiki-content/         @AIMFllys

# 共享层 - 需要两人 review
shared/                    @AIMFllys
backend/app/api/           @AIMFllys
frontend/src/stores/       @AIMFllys
```

### 5.3.3 ESLint 跨层 Import 规则

```json
// .eslintrc.json（新增规则）
{
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        // features 之间禁止互相导入
        {
          "target": "./src/features/admin/",
          "from": "./src/features/workflow/"
        },
        {
          "target": "./src/features/workflow/",
          "from": "./src/features/admin/"
        }
      ]
    }]
  }
}
```

---

## Task 5.4：文档与代码对齐

### 5.4.1 更新 backend/README.md

根据 Phase 2 的新目录结构更新。

### 5.4.2 更新 ARCHITECTURE.md

反映重构后的结构。

### 5.4.3 更新 .agent/skills/project-context/SKILL.md

反映新的目录结构、API 分组、节点系统变化。

### 5.4.4 清理过时文档引用

搜索所有 `docs/plan/TeamNewRefactor/` 和 `docs/Plans/TNRCodex/` 的引用，统一指向 `docs/team/refactor/`。

---

## Task 5.5：CI/CD 增强

### 5.5.1 按路径触发 CI

```yaml
# .github/workflows/ci-backend.yml
on:
  push:
    paths: ['backend/**']
  pull_request:
    paths: ['backend/**']

# .github/workflows/ci-frontend.yml
on:
  push:
    paths: ['frontend/**']
  pull_request:
    paths: ['frontend/**']

# .github/workflows/ci-agent.yml
on:
  push:
    paths: ['agents/**']
  pull_request:
    paths: ['agents/**']
```

### 5.5.2 依赖方向检查（自动化）

在 CI 中添加一个 step 检查是否有违反依赖方向的 import：

```bash
# 检查 nodes/ 是否 import 了 services/
grep -r "from app.services" backend/app/nodes/ && echo "VIOLATION: nodes imports services" && exit 1
```

---

## Phase 5 完成标志

- [ ] Agent Gateway 已实现，至少 1 个子后端可通过 Gateway 调用
- [ ] Wiki 已初始化，至少 3 篇文档可在 `/wiki` 访问
- [ ] CODEOWNERS 已按模块分配
- [ ] ESLint 跨层 import 规则已配置
- [ ] CI 已按路径触发
- [ ] 所有文档已更新到最新状态
- [ ] project-context SKILL.md 已更新

---

## 长期目标（Phase 5 之后）

以下任务在 Phase 5 完成后酌情推进：

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 根级目录重命名 (`frontend/` → `apps/web/`) | 低 | 大量 path 变更，风险高 |
| pnpm workspace 化 | 低 | 当前规模不需要 |
| 插件系统完整实现 | 中 | 等节点单一事实源稳定后 |
| 社区节点安装机制 | 中 | 需要安全审计 |
| 配置架构 nested 化 | 低 | Phase 2 可选遗留 |
| Admin 模块独立部署 | 低 | 流量不大，暂不需要 |

> [!IMPORTANT]
> **不建议现在做的事**（来自 Codex 分析的智慧）：
> - 不建议立刻重命名整个仓库目录树
> - 不建议把所有现有节点改成插件或子后端
> - 不建议让 Wiki 承担设计文档主来源
> - 不建议现在就引入 nx / turborepo
