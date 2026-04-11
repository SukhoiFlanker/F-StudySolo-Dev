# StudySolo 2026-04-11 阶段总结：Store Import 切换第一批

**完成日期**：2026-04-11  
**状态**：已完成本轮最小闭环  
**覆盖范围**：Phase 3 / D2 / Task 3.2b-1，低风险调用方 store import 切换

## 1. 执行摘要

在 `3.2a` 完成 stores 目录重组与兼容层之后，本轮继续推进 `Task 3.2`，但仍然坚持“小步推进”：

- 只切换低风险调用方的 store import
- 不改 store 行为
- 不删除旧 shim
- 不引入 `@/stores` barrel 作为新的统一依赖入口

这一步的价值是让新的分组目录真正开始承接业务调用面，同时保持兼容层继续兜底。

## 2. 本轮完成内容

### 2.1 已切换的调用方批次

本轮完成了以下几类文件的 import 切换：

- tests
  - `ai-chat-store.property.test.ts`
  - `chat-conversation-sync.property.test.ts`
  - `workflow-store.property.test.ts`
  - `workflow-sync.property.test.ts`
  - `sse-store-update.property.test.ts`
- layout / sidebar
  - `usePanelStore` / `SidebarPanel` / `PINNABLE_PANELS` / `LEFT_PANEL_*` / `RIGHT_PANEL_*`
    - 切到 `@/stores/ui/use-panel-store`
  - `useSettingsStore`
    - 切到 `@/stores/ui/use-settings-store`
  - `useAIChatStore` / `useConversationStore`
    - 切到 `@/stores/chat/...`
  - `useWorkflowStore`
    - 切到 `@/stores/workflow/use-workflow-store`
- admin / settings
  - `useAdminStore`
    - 切到 `@/stores/admin/use-admin-store`
  - `useSettingsStore`
    - 切到 `@/stores/ui/use-settings-store`
- app 入口
  - `app/(admin)/admin-analysis/login/page.tsx`
  - `app/(dashboard)/settings/page.tsx`

### 2.2 明确保留的兼容层

本轮故意没有做以下动作：

- 没有修改 `store-path-compat.property.test.ts`
- 没有删除根层 shim
- 没有把调用方改为依赖 `@/stores` barrel
- 没有进入 workflow-heavy hooks / canvas / nodes / execution 文件

### 2.3 收口效果

本轮完成后，前端源码内的路径分布发生了明确变化：

- 旧路径 `@/stores/use-*` 引用数：
  - `76 -> 46`
- 新分组路径 `@/stores/chat|workflow|ui|admin/use-*` 引用数：
  - `6 -> 36`

这说明 `Task 3.2` 已经从“只有目录层完成”进入到“调用面开始真实迁移”的状态。

## 3. 验证

### 测试

执行：

```bash
pnpm --dir frontend test -- \
  src/__tests__/store-path-compat.property.test.ts \
  src/__tests__/ai-chat-store.property.test.ts \
  src/__tests__/chat-conversation-sync.property.test.ts \
  src/__tests__/workflow-store.property.test.ts \
  src/__tests__/workflow-sync.property.test.ts \
  src/__tests__/sse-store-update.property.test.ts \
  src/__tests__/admin-sidebar-navigation.property.test.ts \
  src/__tests__/sidebar-navigation.property.test.ts \
  src/__tests__/workflow-right-panel.property.test.ts
```

结果：

- `31 passed`
- `127 passed`

### ESLint

对本轮改动文件执行 ESLint 后，导入路径本身没有暴露新的错误类型，但命中了两个目标文件中的既有规则问题：

- `frontend/src/components/layout/sidebar/WorkflowExamplesPanel.tsx`
  - `react-hooks/set-state-in-effect`
  - `router` 未使用
- `frontend/src/features/admin/shared/AdminSidebar.tsx`
  - `react-hooks/set-state-in-effect`

这些问题属于历史实现，不是本轮 import 切换新引入的问题。为了保持“只切路径、不改行为”的闭环边界，本轮没有顺手修改相关逻辑。

## 4. 当前状态与下一步

截至本轮结束，`Task 3.2` 的状态可以分为三层：

1. `3.2a`
   - stores 目录重组与兼容层：已完成
2. `3.2b-1`
   - 低风险调用方 import 切换：已完成
3. 剩余部分
   - workflow-heavy hooks / canvas / nodes / execution 以及 workspace shell / memory view 仍未切换

下一小步建议固定为：

- `3.2b-2：继续切 workflow hooks / app workspace shell 的 import`

约束保持不变：

- 仍然不删 shim
- 仍然不改 store 行为
- 仍然不碰 EventBus 和 manifest-first
