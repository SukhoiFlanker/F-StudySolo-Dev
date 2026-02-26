# 总览：按 core 规划的技术选型结论

## 1. 总结结论（可直接执行）

最适合 StudySolo 当前规划的技术栈组合：

1. 工作流执行内核
- `FastAPI + Postgres(状态机) + asyncio` 作为 P0 执行内核。
- P1 引入 `Celery + Redis` 处理重任务与跨进程调度（尤其暂停/恢复与大批量文档处理）。

2. 模型调用协议层
- 统一 `openai-python SDK` 接口抽象。
- 运行态优先 `chat.completions`（兼容性优先），逐步引入 `responses`。
- 结构化输出采用“双轨”：
  - 支持 strict JSON Schema 的模型走 strict。
  - 不支持 strict 的模型走 Pydantic 校验 + 自动重试修复。

3. 知识库检索
- 采用 Supabase 官方推荐路线：`Semantic + Keyword + Hybrid(RRF)`。
- 向量索引优先 `HNSW`。
- 多租户权限采用 `RLS`（必须），不要只在应用层 where 过滤。

4. 实时通道
- 内容流（token流）走 `SSE`。
- 控制流（节点状态、暂停/恢复、人工覆写确认）走 `WebSocket`。
- 前端统一事件总线，避免 SSE/WS 各自维护状态导致冲突。

5. 会员与配额
- 订阅态与配额态解耦：`subscription_state`（套餐）与 `entitlement_state`（可用额度）分表。
- 所有扣减动作写入账本（不可只存最终值），便于纠纷追溯与风控。

## 2. 为什么这是“最适合”

- 与现有规划零冲突：你已明确 FastAPI + Supabase + pgvector + openai SDK。
- 成本与复杂度可控：P0 不引入过重基础设施，先跑通主链路。
- 可平滑升级：P1/P2 再加 Celery、重排、计费增强与运营能力。

## 3. 关键风险（已给出规避）

1. 结构化输出不一致
- 风险：供应商“OpenAI兼容”但能力不完全等价。
- 规避：严格模式能力探测 + 降级校验链路。

2. 实时流不稳定
- 风险：Nginx/CDN 缓冲导致“假实时”。
- 规避：SSE 专门路由 + 禁缓冲 + 心跳保活。

3. 暂停/恢复不可靠
- 风险：只做前端暂停，后端任务仍在跑。
- 规避：数据库状态机 + worker 协作式取消点。

4. 权限泄露
- 风险：RAG 召回跨用户文档。
- 规避：RLS 强约束 + 检索函数内二次限制。
