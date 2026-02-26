# 数据分层与表结构建议（Supabase + pgvector）

## 1. 建议表

- `kb_documents`：文档元数据（title, source_type, owner_id, storage_path, version）
- `kb_document_summaries`：摘要、核心观点、目录结构 JSON
- `kb_document_chunks`：chunk 文本、序号、定位信息（page/section）
- `kb_chunk_embeddings`：chunk 向量
- `kb_summary_embeddings`：摘要向量
- `kb_qa_logs`：问答记录、来源引用、耗时与token统计
- `kb_cache_hits`：缓存命中指标（可选）

## 2. SQL 关键点

1. 启用向量扩展
```sql
create extension if not exists vector with schema extensions;
```

2. 向量维度必须与模型一致
- 若模型输出 1024 维，列定义必须 `vector(1024)`。

3. 索引建议
- 优先 HNSW（生产检索更稳）。
- 规模小时可先顺序扫描，避免过早复杂化。

4. 混合检索
- 语义检索：pgvector
- 关键词检索：PostgreSQL FTS
- 融合：RRF（可先 SQL 实现）

## 3. 权限模型（必须）

- 对 `kb_documents` 与 `kb_document_chunks` 开启 RLS。
- 以 `owner_id` / `workspace_id` 为过滤主键。
- 检索函数（RPC）内也要遵守权限边界。

参考：Supabase `RAG with Permissions` 官方文档。
