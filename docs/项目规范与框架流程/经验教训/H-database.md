# H. 数据库与迁移

## H-01: RLS 未启用 (UNRESTRICTED 表)
**日期**: 2026-03-05
**根因**: 遗留表使用 TEXT 类型的 user_id，与 Supabase auth.uid() (UUID) 不兼容，无法加 RLS
**修复**: 清理 12 张幽灵表 + 锁定 5 张共享表，RLS 覆盖率从 53% 提升到 100%
**防御规则**: 新表必须使用 UUID 外键关联 auth.users，创建后立即启用 RLS

## H-02: FastAPI Query regex → pattern 弃用
**日期**: 2026-03-26
**根因**: FastAPI 0.100+（Pydantic v2）中 Query(..., regex=...) 已弃用
**修复**: 改为 Query(..., pattern=...)
**防御规则**: FastAPI 查询参数验证统一使用 pattern

## H-03: TEXT vs UUID 用户 ID 类型陷阱
**日期**: 2026-03-05
**根因**: auth.uid()::text = user_id 类型转换无法利用索引，且不兼容 RLS
**修复**: 新体系统一 UUID，废弃 TEXT id 遗留表
**防御规则**: 用户 ID 必须为 UUID 类型

## H-04: Migration 中遗漏字段导致 Pydantic 500
**根因**: 模型新增字段但 DB 查询列表未同步更新，序列化失败
**修复**: 从 Pydantic model 动态生成 SELECT 列（同 D-01）
**防御规则**: 模型字段变更时同步更新所有查询列
