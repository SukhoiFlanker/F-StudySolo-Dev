# StudySolo 2026-04-11 阶段总结：Workflow Hooks 与 Workspace Shell Import 切换

**完成日期**：2026-04-11  
**状态**：已完成本轮最小闭环  
**覆盖范围**：Phase 3 / D2 / Task 3.2b-2，workflow hooks 与 workspace shell 的 store import 收口

## 1. 执行摘要

在 `3.2b-1` 完成低风险调用方面的 import 切换之后，本轮继续推进 `Task 3.2`，但仍然只处理“路径收口”，不改行为。

这一步的目标非常具体：

- 把 `features/workflow/hooks` 迁到新分组 store 路径
- 把 `app/(dashboard)/workspace/[id]` 这层 shell 迁到新分组 store 路径
- 故意不碰 workflow components 和 MemoryView，避免把 UI 面扩得太大

## 2. 本轮完成内容

### 2.1 Workflow hooks 路径切换

已完成：

- `chat-conversation-sync.ts`
  - `ChatEntry` / `useConversationStore`
    - 切到 `@/stores/chat/use-conversation-store`
- 以下 hooks 中的 `useWorkflowStore`
  - 切到 `@/stores/workflow/use-workflow-store`
  - 文件包括：
    - `use-action-executor.ts`
    - `use-canvas-clipboard.ts`
    - `use-canvas-context.ts`
    - `use-canvas-dnd.ts`
    - `use-canvas-event-listeners.ts`
    - `use-canvas-keyboard.ts`
    - `use-loop-group-drop.ts`
    - `use-workflow-execution.ts`
    - `use-workflow-sync.ts`
- `use-stream-chat.ts`
  - `ChatEntry` / `useAIChatStore`
    - 切到 chat 分组
  - `useWorkflowStore`
    - 切到 workflow 分组

### 2.2 Workspace shell 路径切换

已完成：

- `WorkflowCanvasLoader.tsx`
  - `useWorkflowStore`
    - 切到 `@/stores/workflow/use-workflow-store`
- `WorkflowPageShell.tsx`
  - `useWorkflowStore`
    - 切到 workflow 分组
  - `useSettingsStore`
    - 切到 `@/stores/ui/use-settings-store`

### 2.3 小范围无行为清理

为了让本轮 hooks / shell 目标文件的 ESLint 检查通过，顺手删除了 `use-action-executor.ts` 中两个未使用项：

- `useCallback` import
- `safePos(...)`

这属于纯清理，不改变任何运行时行为。

## 3. 明确保留的边界

本轮刻意没有处理：

- `app/m/[id]/MemoryView.tsx`
- `features/workflow/components/**`
- `store-path-compat.property.test.ts`
- 任何 shim 删除
- `TypedEventBus`
- `manifest-first`

这意味着 `Task 3.2` 还没有完全结束，但组件层的大面还没有被混进来。

## 4. 验证

### 测试

执行：

```bash
pnpm --dir frontend test -- \
  src/__tests__/chat-conversation-sync.property.test.ts \
  src/__tests__/workflow-sync.property.test.ts \
  src/__tests__/workflow-execution-closure.property.test.ts \
  src/__tests__/loop-group-drop.property.test.ts \
  src/__tests__/integration-fixes.workflow-runbutton.property.test.ts \
  src/__tests__/workflow-right-panel.property.test.ts \
  src/__tests__/store-path-compat.property.test.ts
```

结果：

- `31 passed`
- `127 passed`

### 静态检查

执行：

```bash
pnpm --dir frontend exec eslint \
  src/features/workflow/hooks/chat-conversation-sync.ts \
  src/features/workflow/hooks/use-action-executor.ts \
  src/features/workflow/hooks/use-canvas-clipboard.ts \
  src/features/workflow/hooks/use-canvas-context.ts \
  src/features/workflow/hooks/use-canvas-dnd.ts \
  src/features/workflow/hooks/use-canvas-event-listeners.ts \
  src/features/workflow/hooks/use-canvas-keyboard.ts \
  src/features/workflow/hooks/use-loop-group-drop.ts \
  src/features/workflow/hooks/use-stream-chat.ts \
  src/features/workflow/hooks/use-workflow-execution.ts \
  src/features/workflow/hooks/use-workflow-sync.ts \
  src/app/(dashboard)/workspace/[id]/WorkflowCanvasLoader.tsx \
  src/app/(dashboard)/workspace/[id]/WorkflowPageShell.tsx
```

结果：

- 通过

## 5. 当前状态与下一步

截至本轮结束，`Task 3.2` 已经分三段推进：

1. `3.2a`
   - stores 目录重组与 compat shim
2. `3.2b-1`
   - tests / layout / admin / settings / 低风险 app 入口 import 切换
3. `3.2b-2`
   - workflow hooks / workspace shell import 切换

最合理的下一小步固定为：

- `3.2b-3：切 workflow components 的 store import`

仍然建议保持以下约束不变：

- 不删 shim
- 不改行为
- 不碰 EventBus 与 manifest-first
