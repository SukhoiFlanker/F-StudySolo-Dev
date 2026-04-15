# StudySolo 重构方向总览

> 版本：v1.0 | 2026-04-09
> GitHub Issue：[#10 — Phase 0 收尾 & 完整重构路线图](https://github.com/AIMFllys/StudySolo-Dev/issues/10)
> 详细计划：`docs/issues/TeamRefactor/final-plan/`

---

## 为什么要重构？

StudySolo 当前版本在功能上基本完整，但在 **可维护性** 和 **可扩展性** 上积累了明显的技术债务：

1. **节点定义散落 7 处**：同一份"节点元数据"在后端 3 处、前端 4 处各自维护，新增一个节点需要改 5+ 个文件
2. **AI 对话接口重复 ~80%**：`ai_chat.py`（203 行）和 `ai_chat_stream.py`（273 行）几乎是同一套逻辑的两个副本
3. **前端状态跨域耦合**：`useAIChatStore` 直接调用 `useConversationStore.getState()`，两个独立域的强耦合形成隐患
4. **router.py 过于拥挤**：30+ 个 import，30 个 include_router，所有路由平铺在单一文件，扩展困难
5. **子后端接入无规范**：团队成员独立开发的子服务没有统一的接入契约，各自接入方式不一致

目标不是颠覆现有系统，而是 **在不中断开发的情况下，逐步消灭这些技术债**。

---

## 核心设计目标

### 1. 节点系统 — 单一事实源（SSoT）

**现在**：前端维护一套 NodeType、displayName、icon、category、renderer；后端维护另一套。两者靠人工保持同步，容易漂移。

**目标**：后端 `/api/nodes/manifest` 是节点元数据的唯一权威。前端从这个 API 动态读取，不再独立维护平行定义。

```
前（7处手动维护）         后（2处 + 1个manifest API）
───────────────          ──────────────────────────
_base.py (权威)           _base.py (权威，可声明 renderer)
__init__.py              __init__.py
nodes.py (manifest)      nodes.py (manifest API，含 renderer)
workflow.ts (类型)    →   前端：从 manifest 动态生成类型
workflow-meta.ts      →   前端：从 manifest 读取元数据
NodeStoreDefaultView  →   前端：从 category 动态分组
RENDERER_REGISTRY     →   前端：manifest.renderer 动态映射 + 静态兜底
```

### 2. AI 服务层 — 消除重复逻辑

**现在**：同步对话和流式对话各自实现了认证、Usage 记账、错误处理、上下文注入……本质上是同一逻辑写了两遍。

**目标**：一个 `AIChatService` 类封装所有业务逻辑，路由层只做 HTTP 适配（同步 vs 流式只是最后一层 Response 的差异）。

```python
# 目标 — 路由瘦化
@router.post("/chat")
async def chat(req: ChatRequest, user = Depends(get_current_user)):
    return await AIChatService.handle(req, user, stream=False)

@router.post("/chat/stream")
async def chat_stream(req: ChatRequest, user = Depends(get_current_user)):
    return StreamingResponse(AIChatService.handle(req, user, stream=True))
```

### 3. Usage 追踪 — 装饰器化

**现在**：4 个 AI 相关路由各自散落 `create_usage_record()` 调用，格式和错误处理不一致。

**目标**：`@track_usage(action="ai_chat")` 装饰器统一处理，路由函数专注业务逻辑。

### 4. 子后端接入 — Gateway 规范

**现在**：子后端服务接入方式由各开发者自行决定，没有统一的认证、限流、审计方式。

**目标**：主后端引入 `Agent Gateway` 层，所有子后端通过统一的契约接入：

```
Request Layer：HTTP 头、AuthN、版本协商
Response Layer：统一 JSON 包装、错误码
Runtime Layer：超时设置、重试策略
Governance Layer：限流、审计日志、健康检查
```

---

## 执行顺序

### ⛔ Gate 原则

> **"先冻结，再实施"** — Phase 0 和 Phase 1 是硬性 Gate，不完成则不能进行后续 Phase。

### 时间线（参考）

```
Week 1   Phase 0 ✅（基本完成）→ Phase 1（契约冻结）
Week 2   Phase 1 完成 → Phase 2 + 3 + 4 并行启动
Week 3-4 Phase 2 后端重构
Week 3-4 Phase 3 前端重构
Week 3-4 Phase 4A 节点系统 + Phase 4B 子后端样板
Week 5-6 Phase 5 集成 + Wiki + CI 治理
```

### Phase 简介

| Phase | 核心任务 | 负责人 | 前置 |
|-------|---------|--------|------|
| **Phase 0** | P0 Bug 修复 + 现状冻结文档 | 主系统 | — |
| **Phase 1** | 所有模块接口契约签字冻结 | 全体 | Phase 0 |
| **Phase 2** | 后端：AI 服务合并 + 路由重组 | 主系统 | Phase 1 |
| **Phase 3** | 前端：Store 解耦 + 类型系统 | 主系统 | Phase 1 |
| **Phase 4A** | 节点：manifest-first 架构 | 主系统 | Phase 1 |
| **Phase 4B** | 子后端 Agent 样板仓库 | 小李 | Phase 1 |
| **Phase 5** | Gateway + Wiki + CI 治理 | 全体 | Phase 2-4 |

---

## 不做什么（重要）

以下是本次重构 **明确不做** 的事，避免范围膨胀：

| ❌ 不做 | 原因 |
|--------|------|
| 重命名 `frontend/` → `apps/web/` | 会断裂所有配置、CI、IDE 设置 |
| 引入 pnpm workspace | 当前规模不需要 workspace 化 |
| `pt_`/`fm_` 表清理 | 需先确认外部依赖 |
| Admin 模块拆分独立服务 | 流量小，维护成本 > 收益 |
| 大规模 DB Schema 变更 | 与重构目标无关，单独处理 |

---

## 如何参与

1. **阅读入口**：`docs/issues/TeamRefactor/final-plan/00-索引.md`
2. **当前 Phase**：Phase 0（95% 完成）→ 等待术语表签字后进入 Phase 1
3. **每个 Phase 有明确 Gate**：没有 checklist 全部 ✅，不能进下一 Phase
4. **每个 task 独立 PR**：出问题可以单独 revert，不影响其他任务

---

## 延伸阅读

| 文档 | 内容 |
|------|------|
| [phase-0-foundation.md](final-plan/phase-0-foundation.md) | P0 Bug 修复 + 冻结快照 |
| [phase-1-contract-freeze.md](final-plan/phase-1-contract-freeze.md) | 接口契约定义 |
| [phase-2-backend-refactor.md](final-plan/phase-2-backend-refactor.md) | 后端重构详细任务 |
| [phase-3-frontend-refactor.md](final-plan/phase-3-frontend-refactor.md) | 前端重构详细任务 |
| [phase-4-nodes-and-agents.md](final-plan/phase-4-nodes-and-agents.md) | 节点 SSoT + 子后端样板 |
| [phase-5-integration.md](final-plan/phase-5-integration.md) | Agent Gateway + Wiki + CI |
| [snapshot/node-definitions-audit.md](snapshot/node-definitions-audit.md) | 节点 7 处重复的详细审计 |
| [snapshot/api-inventory.md](snapshot/api-inventory.md) | 当前 API 路由全量清单 |
| [snapshot/terminology.md](snapshot/terminology.md) | 术语冻结表（待三人签字） |
