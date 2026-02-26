# 实时交互与可观测性：SSE 与 WebSocket 协同

## 1. 为什么不能只用一种协议

你的 core 规划同时需要：

- token 级连续文本流
- 节点状态广播、暂停/恢复控制、多人协作预留

最佳实践是分层：

1. SSE：输出流（高兼容、实现简单）
2. WebSocket：控制流（双向交互）

## 2. 事件模型建议（统一前端总线）

统一 envelope：

```json
{
  "run_id": "...",
  "node_id": "...",
  "channel": "sse|ws",
  "event": "node.token|node.status|workflow.paused|...",
  "ts": 0,
  "payload": {}
}
```

前端只认 `event`，不关心底层来自 SSE 还是 WS。

## 3. 服务端实现要点

- SSE 端点使用 `sse-starlette`。
- 必须心跳（ping）防止中间层断链。
- Nginx 对 SSE 路径关闭缓冲（你现有规划已提及）。
- WebSocket 要处理断线重连与会话恢复。

## 4. UI 可观测面板建议

- 节点级：`pending/running/paused/done/error`
- 模型级：provider/model/latency/tokens
- 检索级：summary_hit/chunk_hit/citation_count
- 系统级：queue_backlog/retry_count/cache_hit

## 5. 常见坑

- SSE 与 WS 事件重复导致 UI 状态抖动。
- 未做事件去重（按 `event_id`）。
- 后端时钟不统一，前端排序错乱。
