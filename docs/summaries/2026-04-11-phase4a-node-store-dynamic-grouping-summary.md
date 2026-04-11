<!-- 编码：UTF-8 -->

# StudySolo 2026-04-11 阶段总结：Phase 4A NodeStore 动态分组接线

**完成日期**：2026-04-11  
**状态**：Phase 4A 的 NodeStore 动态分组已进入真实运行路径，但当前仍保留静态 fallback，`workflow-meta.ts` 与节点 version 治理尚未纳入本轮  
**覆盖范围**：默认节点商店视图的动态分组接线、静态兜底策略、分组选择归一化、以及相关定向测试

## 1. 执行摘要

这轮工作的重点不是继续讨论“NodeStore 以后要不要完全动态化”，而是先把上一轮已经抽出的分组适配层真正接到默认节点商店视图上，形成可运行、可回退、可继续推进的第二个 Phase 4A 闭环。

本轮完成后，NodeStore 的分组行为变成：

1. manifest 正常可用时，按 manifest 中实际出现的节点类型生成当前商店的非空分组
2. manifest 处于加载中、请求失败或为空时，回退到完整静态 5 组
3. 当前选中的分组如果在动态结果中不存在，会自动回退到 `all`
4. `community_node` 与未来未知节点继续不进入默认商店

换句话说，当前 NodeStore 已经不再只靠组件内部那一份硬编码分组常量驱动，而是开始真正消费 manifest 运行时结果；但它仍然保留了静态兜底，因此不属于激进切换。

## 2. 改动前的真实状态

在这轮开始前，仓库已经完成了上一轮的 adapter-only 闭环：

1. `frontend/src/components/layout/sidebar/resolve-node-store-groups.ts`
   - 已能把 manifest 节点投影为当前 5 组产品语义
   - 已能识别 `community_node` 与未来未知类型
2. `frontend/src/__tests__/node-store-groups.property.test.ts`
   - 已锁住静态骨架、分组顺序与 `unmappedManifestTypes`

但真正的默认节点商店视图仍然没有接线：

1. `frontend/src/components/layout/sidebar/NodeStoreDefaultView.tsx`
   - 还保留本地 `NODE_CATEGORIES`
   - 标签栏、顶部文案、分组区都还是直接依赖静态常量
2. `useNodeManifest()`
   - 已返回 `manifest / isLoading / error`
   - 但 `NodeStoreDefaultView` 只用了 `manifest`，没有利用加载态和错误态做分组兜底

所以这轮的正确目标不是“再讨论抽象 adapter”，而是把 adapter 接进真实组件。

## 3. 本轮已完成的代码闭环

### 3.1 扩展分组 adapter 的 view 层纯函数

文件：

- `frontend/src/components/layout/sidebar/resolve-node-store-groups.ts`

本轮新增了第二轮接线需要的纯函数接口：

1. `ALL_NODE_STORE_CATEGORY_ID = 'all'`
2. `NodeStoreGroupMode = 'dynamic' | 'static-fallback'`
3. `resolveNodeStoreGroupsForView(manifest, isLoading, error)`
4. `resolveSelectedNodeStoreCategory(selectedCategoryId, groups)`

这让“什么时候动态、什么时候回退、当前选中项怎么归一化”不再散落在组件里，而是集中到一个可测试模块中。

### 3.2 默认节点商店视图已切到动态分组

文件：

- `frontend/src/components/layout/sidebar/NodeStoreDefaultView.tsx`

本轮实际完成了以下切换：

1. 删除组件内部的 `NODE_CATEGORIES` 常量依赖
2. 改为消费 `resolveNodeStoreGroupsForView(...)`
3. 标签栏改为读取动态分组
4. 顶部文案改为读取归一化后的当前分组
5. `visibleCategories` 改为依赖动态组 + 当前选择归一化结果

但为了控制风险，本轮刻意保留了这些边界：

1. 图标映射仍保留在组件内，只是改为 `NodeStoreGroupId -> LucideIcon`
2. `resolveNodeStoreCopy(...)` 保持不变，标题和描述仍然是 manifest-first + `workflow-meta` 回退
3. `community_node` 与未知节点不新增 UI 展示
4. 不新增错误提示 UI 和 loading skeleton

### 3.3 动态组的显示规则已锁定

当前 NodeStore 的组展示策略已被明确固定：

1. **静态 fallback 场景**
   - `isLoading === true`
   - `error !== null`
   - `manifest.length === 0`

   以上三种情况都会回退到完整静态 5 组。

2. **动态分组场景**
   - manifest 非空且无加载/错误
   - 此时只显示 manifest 实际有节点的非空组

3. **当前选中项归一化**
   - 如果用户之前选中的组不在当前动态分组里，自动回退到 `all`
   - 不额外引入 state reset effect，仅通过纯函数归一化实现

## 4. 测试与验证

文件：

- `frontend/src/__tests__/node-store-groups.property.test.ts`

本轮在原有分组测试基础上继续补齐了第二轮行为覆盖：

1. `loading / error / empty manifest` → 静态 5 组 fallback
2. partial manifest → 只显示非空组
3. 当前分组在动态结果里缺失 → 回退到 `all`
4. `community_node` 和未知类型继续保留在 `unmappedManifestTypes`

### 实际验证结果

已通过：

- `pnpm --dir frontend test -- src/__tests__/node-store-groups.property.test.ts src/__tests__/node-store-copy.property.test.ts src/__tests__/node-manifest.service.property.test.ts`
  - 结果：`19 passed`

- `pnpm --dir frontend exec eslint src/components/layout/sidebar/NodeStoreDefaultView.tsx src/components/layout/sidebar/resolve-node-store-groups.ts src/__tests__/node-store-groups.property.test.ts`
  - 结果：通过

## 5. 当前边界与下一步

本轮完成后，Phase 4A 关于 NodeStore 的判断更准确地变成：

1. 默认节点商店视图已切到动态分组运行路径
2. 静态 fallback 仍保留，尚未进入激进清理阶段
3. `community_node` / 未知节点的默认商店可见性仍冻结不动
4. `workflow-meta.ts` 结构职责仍然存在，本轮没有收缩
5. 节点 `version` 字段仍只有统一存在，尚未进入治理基线

因此，NodeStore 这一支已经从“只在文档里说要 manifest-first”推进到了“真实运行时已接线”；但 Phase 4A 还没有彻底结束，后续真正剩下的主线是：

1. 评估节点 version/changelog 基线
2. 再决定 `workflow-meta.ts` 何时进入 deprecate

## 6. 本轮提交

- `6b0f96d feat(frontend): wire node store dynamic groups`
