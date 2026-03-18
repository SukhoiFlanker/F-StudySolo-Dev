# 工作流连线系统重设计

## Goal
重构连线系统：线只有顺序线一种，条件分支通过 `logic_switch` 节点分叉表达，循环通过可缩放 `LoopGroupNode` 容器表达。前后端执行语义完全对齐。

---

## Phase 1: 清理旧的错误设计 + 顺序线基础

### Task 1.1: 删除多余的 edge 类型和组件
- 删除 `ConditionalEdge.tsx`、`LoopEdge.tsx`（保留 `SequentialEdge.tsx`）
- 删除 `LoopRegionNode.tsx`、`use-loop-region.ts`
- `WorkflowCanvas.tsx` 的 `edgeTypes` 只保留 `{ default: AnimatedEdge, sequential: SequentialEdge }`
- `nodeTypes` 移除 `loop_region`
- `types/workflow.ts` 的 `EdgeType` 改为仅 `'sequential'`
- Store 删除 `activeEdgeType`、`setActiveEdgeType`，`onConnect` 固定 `type: 'sequential'`
- 删除 `use-loop-region.ts` 的 `useLoopRegion()` 调用
- Verify: `npx tsc --noEmit` 零 edge 相关报错

### Task 1.2: 重设计工具栏编辑面板 (CanvasPlacementPanel)
- 重写 `EdgeTypePanel.tsx` → `CanvasPlacementPanel.tsx`
- 3 个选项：「顺序连线」「条件分支」「循环块」
- 样式与主工具栏一致（暗色/毛玻璃/紧凑），尺寸更小
- 选「顺序连线」→ 激活 click-to-connect 模式（现有机制）
- 选「条件分支」→ 点击画布放置 `logic_switch` 节点
- 选「循环块」→ 点击画布放置 `LoopGroupNode` 容器
- `FloatingToolbar.tsx` 中更新引用
- Verify: 打开面板，三个选项水平排列正常

### Task 1.3: 顺序线备注功能
- `SequentialEdge.tsx` 增加 `EdgeLabelRenderer` 显示 `data.note`
- 双击线 → 出现文本输入框 → 编辑 `edge.data.note`
- `EdgeContextMenu.tsx` 保留编辑/反转/删除，移除"切换类型"
- `types/workflow.ts` 更新 `WorkflowEdgeData` → `{ note?: string; waitSeconds?: number }`
- Verify: 双击顺序线可编辑备注，显示在线段上方

---

## Phase 2: 条件分支 (logic_switch 节点分叉)

### Task 2.1: logic_switch 节点专用视觉
- `AIStepNode.tsx` 的 `getNodeTheme()` 中给 `logic_switch` 设计独特主题（amber 色调 + ⑂ 分叉图标）
- logic_switch 节点的 source handles 增加视觉提示（"从这里拉出分支"）
- Verify: 画布上 logic_switch 节点明显区别于其他节点

### Task 2.2: 分支标签编辑器
- 从 `logic_switch` 节点出发的 edge 自动在线上显示 `data.branch` 标签（amber 虚线风格）
- `SequentialEdge.tsx` 检测 source node type = `logic_switch` → 自动切换为 amber 虚线渲染 + 分支标签
- 点击分支标签 → 编辑分支名（"A" / "B" / "默认"）
- `onConnect` 时检测 source 是 logic_switch → 自动设置 `data.branch`（按已有分支数量自动递增 A→B→C）
- Verify: 从 logic_switch 拉 3 条线到不同节点，每条线显示不同分支名

### Task 2.3: 分支面板 UI
- logic_switch 节点右侧属性面板中新增分支管理区域
- 显示所有出边的分支列表，可添加/删除分支
- 判断模式切换：`AI 智能判断`（默认）/ `规则判断`（Phase 3 实现，先显示 disabled）
- Verify: 属性面板中能看到当前分支列表

---

## Phase 3: 循环容器块

### Task 3.1: LoopGroupNode 前端组件
- 新建 `LoopGroupNode.tsx` — React Flow Group Node
- 使用 `@xyflow/react` 的 `NodeResizer` 实现四向缩放
- 容器头部：🔄 标签 + 循环次数 + 间隔时间（可点击编辑）
- 两个 handles：LEFT=target（输入），RIGHT=source（输出）
- 默认尺寸 500×350，虚线 emerald 边框
- `nodeTypes` 注册 `loop_group: LoopGroupNode`
- 子节点通过 `parentId` + `extent: 'parent'` 嵌入容器
- Verify: 放置循环块可四向缩放，拖入子节点自动绑定

### Task 3.2: CanvasPlacementPanel → 循环块放置逻辑
- 选「循环块」→ 点击画布 → 在点击位置创建 `loop_group` 节点
- 默认参数：`maxIterations: 3, intervalSeconds: 0`
- 支持拖拽现有节点进入容器（设置 `parentId`）和拖出容器（清除 `parentId`）
- Verify: 点击画布放置循环块，拖入节点成功

### Task 3.3: 循环块参数面板
- 循环块选中或双击 → 属性面板显示参数配置
- 循环次数：数字输入框，范围 1-100
- 间隔时间：数字输入框，范围 0.1-300s
- 备注描述：文本输入框
- Verify: 修改参数后数据正确保存到 node.data

### Task 3.4: 后端循环执行器
- `executor.py` 新增 `_execute_loop_group()` 函数
- `topological_sort_levels()` 排除 `parentId` 不为空的节点（它们由循环执行器管理）
- 主执行循环遇到 `loop_group` 节点 → 调用 `_execute_loop_group()`
- 内部执行：提取容器子节点+子边 → 为子图做独立拓扑排序 → 重复 N 次
- 每次迭代注入上一轮输出作为输入（累积器模式）
- SSE 新增事件：`loop_iteration`（`{group_id, iteration, total}`）
- 间隔等待：`await asyncio.sleep(interval_seconds)`
- Verify: 含循环块的工作流正确执行 N 次迭代

---

## Phase 4: 顺序线等待功能

### Task 4.1: 前端等待配置
- `EdgeContextMenu.tsx` 增加"设置等待时间"选项
- 双击顺序线时的编辑面板支持设置 `waitSeconds`（0-300s）
- 线上显示等待标识（⏱ 3s）
- Verify: 设置等待时间后线上显示计时器图标

### Task 4.2: 后端等待逻辑
- `executor.py` 执行节点前检查入边 `waitSeconds`
- 取所有入边的最大 `waitSeconds`
- `await asyncio.sleep(max_wait)` + SSE 事件 `node_status: waiting`
- 安全上限校验：最大 300 秒
- Verify: 设置等待 3s 的边，执行时目标节点延迟 3s 后开始

---

## Phase 5: 最终验证

### Task 5.1: 端到端测试
- 构建测试工作流：2 个节点 + 顺序线 + 备注 → 执行成功
- 构建测试工作流：logic_switch + 3 个分支 → AI 判断后走正确分支
- 构建测试工作流：循环块内含 2 个节点 → 循环 3 次 → 输出聚合结果
- 构建测试工作流：顺序线带等待 2s → 延迟执行正常
- Verify: 全部场景通过

### Task 5.2: 旧数据兼容
- `setCurrentWorkflow` 中旧 edge 的 `type: 'conditional' | 'loop'` 自动迁移为 `'sequential'`
- 旧的 `loop_region` 节点自动忽略（不渲染）
- Verify: 已有工作流打开后正常显示

---

## 影响文件清单

### 删除
- `frontend/src/features/workflow/components/canvas/edges/ConditionalEdge.tsx`
- `frontend/src/features/workflow/components/canvas/edges/LoopEdge.tsx`
- `frontend/src/features/workflow/components/nodes/LoopRegionNode.tsx`
- `frontend/src/features/workflow/hooks/use-loop-region.ts`
- `frontend/src/features/workflow/components/toolbar/EdgeTypePanel.tsx`

### 新建
- `frontend/src/features/workflow/components/toolbar/CanvasPlacementPanel.tsx`
- `frontend/src/features/workflow/components/nodes/LoopGroupNode.tsx`

### 修改
- `frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx` — edgeTypes/nodeTypes 注册
- `frontend/src/features/workflow/components/canvas/edges/SequentialEdge.tsx` — 备注 + 分支线检测
- `frontend/src/features/workflow/components/canvas/EdgeContextMenu.tsx` — 去掉切换类型，加等待
- `frontend/src/features/workflow/components/toolbar/FloatingToolbar.tsx` — 引用新面板
- `frontend/src/features/workflow/components/nodes/AIStepNode.tsx` — logic_switch 主题
- `frontend/src/stores/use-workflow-store.ts` — 删除 activeEdgeType，加放置逻辑
- `frontend/src/types/workflow.ts` — EdgeType 简化，新增 LoopGroupNodeData
- `frontend/src/styles/workflow.css` — 新样式
- `backend/app/engine/executor.py` — 循环执行器 + 等待逻辑
- `backend/app/models/workflow.py` — 无结构变更（已是 `list[dict]`）

## Notes
- Phase 1-2 纯前端改动，后端 0 变更（logic_switch 后端已完成）
- Phase 3 前后端同步开发，循环执行器是最复杂的单点
- Phase 4 前后端简单改动
- 每个 Phase 独立可交付，完成后即可验证
