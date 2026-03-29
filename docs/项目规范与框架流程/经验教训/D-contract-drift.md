# D. 前后端契约漂移

## D-01: Pydantic 模型字段遗漏导致 500
**日期**: 2026-03-25
**根因**: _MARKETPLACE_COLS 硬编码 SELECT 字段，漏掉 status，Pydantic 序列化验证失败 -> 500
**修复**: 从 Pydantic model_fields 动态生成 SQL 列列表（classmethod select_cols()）
**防御规则**: 禁止硬编码 DB 列字符串

## D-02: role vs tier 字段混淆
**日期**: 2026-03-25
**根因**: /me 端点将 tier 塞进 role 字段返回，前端 user.role 做了订阅等级判断
**修复**: role（JWT系统角色）和 tier（订阅等级）严格分离
**防御规则**: IAM (role) 与 Billing (tier) 永不混用

## D-03: 前后端命名规范不一致
**日期**: 2026-03-25
**根因**: DB 中 pro_plus vs 前端 Plus (PascalCase)，字符串比较永远不匹配
**修复**: 全链路统一 snake_case，前端仅用 getTierLabel() 做展示映射
**防御规则**: 数据字段全链路 snake_case，展示文本通过映射函数渲染

## D-04: 前端重复类型定义
**日期**: 2026-03-25
**根因**: 组件内部本地定义 WorkflowMeta，与 types/workflow.ts 不同步
**修复**: 删除本地重复定义，统一从 @/types/workflow 导入
**防御规则**: 一个类型只能有一个定义源

## D-05: user_id 作为 JOIN key 但不在 Pydantic Model 中
**日期**: 2026-03-26
**根因**: select_cols() 不含 user_id（model 不存在），批量关联时 KeyError
**修复**: _COLS = WorkflowMeta.select_cols() + ",user_id" 追加临时 join key 并注释原因
**防御规则**: 需要额外 JOIN key 时显式追加并注释

## D-06: 前后端 SSE 事件类型未同步
**日期**: 2026-03-26
**根因**: 后端已发出 waiting/skipped/loop_iteration，前端类型和消费逻辑未覆盖
**修复**: NodeStatus 补齐 waiting/skipped；WorkflowSSEEvent 补齐 loop_iteration
**防御规则**: 新增运行态必须同步更新 types/workflow.ts + types/workflow-events.ts + use-workflow-execution.ts + api.md
