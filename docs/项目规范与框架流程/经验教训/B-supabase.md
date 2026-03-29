# B. Supabase 客户端初始化错误

## B-01: 服务端 Supabase — 缺少运行时守卫
**日期**: 2026-03-29
**根因**: server.ts 直接用 process.env.XXX! 传给 createServerClient，缺失时产生不可读的 500
**修复**: 显式校验变量后再初始化，缺失时抛含描述的 Error
**防御规则**: 所有 Supabase 初始化必须有守卫 + 描述性错误

## B-02: supabase-py .single() 空结果抛异常
**日期**: 2026-03-25
**根因**: Python supabase-py .single() 在 0 行时抛 APIError(PGRST116)，JS SDK 返回 { data: null }
**修复**: 改用 .limit(1).execute()，手动检查 rows = result.data or []
**防御规则**: Python 禁止 .single() 用于可能为空的查询，统一用 .maybe_single() 或 .limit(1)

## B-03: Cookie Domain 跨子域不一致
**根因**: Auth Cookie domain 未设置，子域间无法共享登录状态
**修复**: 配置 NEXT_PUBLIC_COOKIE_DOMAIN=.1037solo.com
**防御规则**: 跨子域必须显式配置 cookie domain

## B-04: .env 文件位置错误 / 跨项目污染
**日期**: 多次
**根因**: 部署时误将其他项目 .env 复制到当前目录；.env.production 未放在 frontend/ 下
**修复**: 每个 .env 文件第一行加标识注释（项目名 + 环境）
**防御规则**: .env 第一行必须写项目名和环境标识；端口需与 Nginx proxy_pass 交叉校验
