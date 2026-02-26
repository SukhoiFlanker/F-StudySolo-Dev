# 分阶段落地计划（与现有 PROJECT_PLAN 对齐）

## Phase A：基础可用（1~2 周）

- 完成文档上传、解析、摘要生成。
- 建立 `documents/summaries/chunks/embeddings` 基础表。
- 实现摘要层优先问答。

交付标准：
- 能对单文档稳定回答概览问题。

## Phase B：检索增强（1~2 周）

- 增加 chunk 向量检索。
- 增加关键词检索 + Hybrid(RRF)。
- 增加来源引用与原文定位。

交付标准：
- 细节问题准确率明显提升，答案可追溯。

## Phase C：工程化与成本优化（1~2 周）

- 增加 Redis 缓存。
- 增加任务队列（按流量决定是否 Celery/RQ）。
- 监控指标面板（耗时/token/命中率/成本）。

交付标准：
- 高频查询命中缓存，单位成本下降。

## Phase D：权限与商用能力（1 周+）

- 引入 RLS 级别权限隔离。
- 对“深度原文定位/联网深搜/高级重排”做会员能力分层。

交付标准：
- 多租户/多用户场景安全可控，具备商业化边界。

## 与你现有规划的直接衔接点

- 后端：`/api/ai/*` 增加 `knowledge_query` 与 `knowledge_ingest` 路由。
- SSE：沿用当前流式机制，返回阶段事件（retrieval_started / rerank_done / answer_stream）。
- 数据库：延续 Supabase + pgvector，避免新增系统复杂度。
