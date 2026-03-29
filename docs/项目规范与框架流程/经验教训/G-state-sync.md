# G. 状态管理与同步竞态

## G-01: isDirty 恢复后被强制重置为 false
**日期**: 2026-03-17
**根因**: setCurrentWorkflow 总是设 isDirty: false，IndexedDB 恢复的脏缓存永远不会同步到云端
**修复**: setCurrentWorkflow 接受 dirty 参数，恢复脏缓存时传 true
**防御规则**: 状态恢复逻辑不能无条件重置 dirty 标记

## G-02: React Effect 依赖布尔值做节流 — 永远只触发一次
**日期**: 2026-03-17
**根因**: useEffect([isDirty]) 中的 debounce — 连续修改时 isDirty 保持 true 不变，Effect 不重建 timer
**修复**: 改为 setInterval + snapshot diff，不依赖 React Effect 身份触发
**防御规则**: 不要用 React Effect 做节流/防抖，用 setInterval 或 useRef + timer

## G-03: 前后端保存竞态（执行期间同步覆盖）
**日期**: 2026-03-17, 2026-03-27
**根因**: 后端执行完写 nodes_json，前端 debounce sync 紧接着用旧快照覆盖
**修复**: 执行改为 POST 直接提交当前内存图，不再依赖「执行时冻结同步」
**防御规则**: 执行一致性来源 = 请求体明确传图，不是「锁」

## G-04: 硬编码 Mock 数据忘记替换
**日期**: 2026-03-25
**根因**: const USER_TIER = 'Plus' 硬编码，永远显示 Plus，不反映真实数据
**修复**: 替换为真实 API 调用获取 tier
**防御规则**: Mock/硬编码数据必须加 // TODO: mock - replace with real data 注释
