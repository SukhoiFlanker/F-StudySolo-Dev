# StudySolo 2026-04-11 阶段总结：Usage 跟踪统一与前端桥接解耦

**完成日期**：2026-04-11  
**状态**：已完成本阶段交付  
**覆盖范围**：Workflow 测试维稳、AI Chat usage 收口、前端桥接解耦、Workflow Service 统一、架构文档同步

## 1. 执行摘要

在 2026-04-10 Phase 2 后端架构重构结案的基础上，今天的核心目标不是继续大拆大建，而是把新结构真正变成“可维护的稳定基线”。

本轮完成了四项关键动作：

1. **恢复 Workflow 路由测试基线**
   - 修复了命名空间迁移后失效的 monkeypatch 边界。
2. **将 `@track_usage` 推广到非流式 AI Chat**
   - 统一 assistant 类请求的 usage 生命周期。
3. **拆掉前端 AI Chat store 对 conversation store 的隐式耦合**
   - 建立显式的 conversation persistence bridge。
4. **统一浏览器侧 Workflow Service mutation 请求路径**
   - 避免 header / cookie / token 三种认证方式继续扩散。

这意味着项目当前已经从“Phase 2 结构完成，但边界仍有遗留散点”进入到“Phase 3 可继续推进的稳定过渡态”。

## 2. 本轮完成项

### 2.1 Workflow 测试基线重建

涉及文件：

- `backend/tests/_helpers.py`
- `backend/tests/test_workflow_execute_route_property.py`
- `backend/tests/test_workflow_crud_property.py`
- `backend/tests/test_workflow_update_property.py`

本轮将 Workflow 路由测试重新对齐到了当前命名空间结构：

- 不再假设旧的 `app.api.workflow_execute` 路径存在
- 对 `execute.py` 当前真实依赖面重建 patch/stub
- 统一 JWT 构造 helper，减少测试间重复与漂移

达到的效果：

- Workflow 关键路由测试从“结构已重构但测试失真”恢复为“能真实保护当前路由契约”

### 2.2 非流式 AI Chat usage 统一

涉及文件：

- `backend/app/services/usage_tracker.py`
- `backend/app/api/ai/chat.py`
- `backend/tests/test_ai_chat_usage_tracking_property.py`

核心调整：

- `track_usage(...)` 新增 `status_resolver`
- `/api/ai/chat` 由手写 usage 生命周期改为 decorator 托管
- `/api/ai/chat-stream` 保持显式计量路径不变

关键语义被明确下来：

- 正常返回：`completed`
- 付费模型限制但返回正常响应体：`failed`
- 抛异常：`failed`

这一步的价值不只是“少写几行 try/finally”，而是把 assistant 域的 usage 语义开始收口为统一模型，为后续 usage analytics、额度解释和审计提供一致入口。

### 2.3 前端 AI Chat 与 Conversation Store 解耦

涉及文件：

- `frontend/src/stores/use-ai-chat-store.ts`
- `frontend/src/features/workflow/hooks/chat-conversation-sync.ts`
- `frontend/src/features/workflow/hooks/use-stream-chat.ts`
- `frontend/src/components/layout/sidebar/SidebarAIPanel.tsx`
- `frontend/src/__tests__/ai-chat-store.property.test.ts`
- `frontend/src/__tests__/chat-conversation-sync.property.test.ts`

重构结果：

- `useAIChatStore.pushMessage()` 不再隐式操作 conversation store
- conversation 持久化变为显式行为
- UI 仍可通过 `syncHistory()` 做流式占位展示
- assistant 最终落盘和快捷指令消息落盘全部走 bridge helper

这一步解决的不是代码风格问题，而是状态边界问题：

- 过去：AI chat store 内部悄悄驱动 conversation store，职责混杂
- 现在：AI chat store 只管本地 UI 状态，conversation 持久化由调用方决定

这使后续 Task 3.2 / 3.4 能在更清晰的边界上继续推进。

### 2.4 Workflow Service 浏览器侧收口

涉及文件：

- `frontend/src/services/workflow.service.ts`
- `frontend/src/services/workflow.server.service.ts`
- `frontend/src/__tests__/workflow-service.property.test.ts`

本轮没有删除 server service，而是先建立清晰角色分工：

- `workflow.service.ts`
  - 浏览器侧主入口
  - mutation 请求统一走 shared fetch helper
- `workflow.server.service.ts`
  - 继续承担 SSR / RSC 的 token/cookie 适配

这一步的价值在于先止血：

- 不再继续扩散“有的请求只带 cookie，有的再额外带 Authorization header，有的手动取 Supabase token”
- 后续若要继续做 service consolidation，有了明确主从关系

### 2.5 架构文档同步

涉及文件：

- `.agent/ARCHITECTURE.md`

已同步的事实包括：

- 后端 Phase 2 的目录命名空间
- usage tracker 在非流式 AI 端点中的定位
- 前端 AI Chat / conversation bridge 的职责分工
- workflow service / workflow server service 的当前角色

## 3. 当前工程状态评估

### 3.1 已稳定的部分

1. **后端命名空间结构**
   - `api/workflow`
   - `api/ai`
   - `services/llm`
2. **Workflow 路由测试基线**
   - 关键路径已回绿
3. **非流式 assistant usage 计量**
   - 已开始统一
4. **前端对话桥接的最危险耦合点**
   - 已拆除
5. **Workflow 浏览器侧 mutation 请求策略**
   - 已开始收口

### 3.2 仍未完成的部分

1. **Phase 3 stores 目录重组**
   - 尚未开始
2. **TypedEventBus**
   - 尚未开始
3. **manifest-first 前端适配**
   - 尚未开始
4. **流式 AI Chat 与非流式 AI Chat 的更深层共享逻辑抽取**
   - 本轮故意没有推进，以避免同时改动 usage 与 SSE 生命周期

### 3.3 当前最重要的结论

项目已经不再处于“必须先救火”的状态。  
现在最合理的策略不是继续追加局部 patch，而是按 Phase 3 的任务顺序，逐步把前端桥接和状态边界做成新的稳定结构。

## 4. 后续操作建议

建议按以下顺序推进。

### 4.1 下一手：Task 3.2 stores 目录重组

原因：

- 副作用已经拆开，目录迁移的风险比之前低很多
- 当前 stores 仍在根目录平铺，继续增加功能只会让后续搬迁成本上升

建议做法：

- 先只做物理重组，不混入新行为
- 保持导出兼容层，避免 import 一次性全炸
- 优先收 `ai-chat`、`conversation`、`workflow` 三个域

### 4.2 第二手：Task 3.4 TypedEventBus

原因：

- 当桥接与 stores 目录清晰后，EventBus 才不会变成“另一层耦合”
- 事件边界应该建立在职责已经分明的 store/service 之上

建议做法：

- 先处理聊天、工作流执行、history refresh 三类事件
- 只定义最小事件集，不一次性抽象全平台事件

### 4.3 第三手：Task 3.5 manifest-first 前端适配

原因：

- 这一步会开始触碰 backend manifest schema 和前端节点渲染协议
- 属于跨端契约升级，不适合和前两步混在一个交付里

建议做法：

- 先做 manifest schema 缺口扫描
- 明确 backend 还缺哪些字段，例如 renderer / capability hints / config schema 元信息
- 再决定前端 form renderer 的切换节奏

## 5. 验证结果

### 后端

执行：

```bash
pytest backend/tests/test_ai_chat_usage_tracking_property.py \
  backend/tests/test_workflow_execute_route_property.py \
  backend/tests/test_workflow_crud_property.py \
  backend/tests/test_workflow_update_property.py -q
```

结果：

- `11 passed`

### 前端

执行：

```bash
pnpm --dir frontend test -- \
  src/__tests__/ai-chat-store.property.test.ts \
  src/__tests__/chat-conversation-sync.property.test.ts \
  src/__tests__/workflow-service.property.test.ts
```

结果：

- `6 passed`

### 静态检查

执行：

```bash
pnpm --dir frontend exec eslint \
  src/services/workflow.service.ts \
  src/stores/use-ai-chat-store.ts \
  src/components/layout/sidebar/SidebarAIPanel.tsx \
  src/features/workflow/hooks/use-stream-chat.ts \
  src/features/workflow/hooks/chat-conversation-sync.ts \
  src/__tests__/ai-chat-store.property.test.ts \
  src/__tests__/chat-conversation-sync.property.test.ts \
  src/__tests__/workflow-service.property.test.ts
```

结果：

- 通过

## 6. 风险与注意事项

1. **`chat.py` 当前仍包含部分历史中文字符串的显示链路乱码**
   - 文件为 UTF-8，可正常读写
   - 本轮只修复了语法风险，没有做全文件中文文案清洗
   - 后续如果要清理文案，必须逐段最小 patch，禁止整文件重写
2. **`workflow.server.service.ts` 仍然存在**
   - 这是当前兼容层，不是技术债失控
   - 不建议在 stores 重组前贸然删除
3. **本轮没有碰 `test_ai_routing_property.py`**
   - 该测试继续视为 stale，不应被误认为本轮遗漏

## 7. 结论

截至 2026-04-11，StudySolo 已完成从“后端结构重构刚刚结束”到“后端与前端桥接开始稳定化”的过渡。

当前项目最适合的推进方式不是再做一次大爆破式重构，而是继续沿着 Phase 3 的顺序，把：

- store 目录
- 事件边界
- manifest-first

三件事拆成三个独立闭环，逐段推进。
