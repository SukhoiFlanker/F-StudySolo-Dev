# A. Next.js / TypeScript 构建错误

## A-01: Window 类型转换错误 (Turbopack)

**日期**: 2026-03-29
**错误信息**:
```
Conversion of type 'Window & typeof globalThis' to type 'Record<string, unknown>'
may be a mistake because neither type sufficiently overlaps with the other.
```
**根因**: TypeScript 的 `Window` 接口没有 index signature，无法直接 `as Record<string, unknown>`
**修复**:
```ts
// 正确做法：用 declare global 增广 Window 接口
declare global {
  interface Window {
    __ENV__?: Record<string, string>
  }
}
// 然后可以直接访问：
if (typeof window !== 'undefined' && window.__ENV__) { ... }
```
**防御规则**: ❌ 禁止 `(window as Record<string, unknown>)` ✅ 必须用 `declare global` 增广

---

## A-02: Turbopack Chunk-Splitting 环境变量丢失

**日期**: 2026-03-28~29
**错误信息**: 无明确报错，表现为 `createBrowserClient(undefined, undefined)` 静默失败
**根因**: Next.js 16 Turbopack 的 chunk 分割在某些 JS 束中**不替换** `process.env.NEXT_PUBLIC_*`，导致运行时为 `undefined`
**修复**:
```tsx
// app/layout.tsx — 在 <head> 注入同步 script
<script dangerouslySetInnerHTML={{ __html: `
  window.__ENV__ = {
    NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}"
  };
`}} />

// client.ts — 优先读取 window.__ENV__
function getEnv(key: string): string {
  if (typeof window !== 'undefined' && window.__ENV__?.[key]) {
    return window.__ENV__[key]
  }
  return process.env[key] ?? ''
}
```
**防御规则**: 客户端环境变量 **必须** 走 `getEnv()` 函数，禁止裸 `process.env.NEXT_PUBLIC_*`

---

## A-03: 非空断言 (`!`) 掩盖缺失环境变量

**根因**: `process.env.NEXT_PUBLIC_SUPABASE_URL!` 用非空断言绕过 TS 检查，生产缺失时变为 `undefined` 但不报错
**修复**:
```ts
// ❌ 错误
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...)

// ✅ 正确
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!url) throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing')
const client = createClient(url, ...)
```
**防御规则**: ❌ 禁止 `process.env.XXX!` ✅ 必须显式验证后再使用

---

## A-04: middleware.ts 弃用警告

**日期**: 2026-03-29
**错误信息**: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
**根因**: Next.js 16 将 `middleware.ts` 重命名为 `proxy.ts`
**修复**: 稳定后将文件从 `src/middleware.ts` 迁移到 `src/proxy.ts`，内容不变
**防御规则**: 新项目直接使用 `proxy.ts`；当前不阻塞构建可延后处理

---

## A-05: useSearchParams 缺少 Suspense 边界

**错误信息**: `useSearchParams() should be wrapped in a suspense boundary at page "..."`
**根因**: Next.js 15+ 要求 `useSearchParams()` 的组件被 `<Suspense>` 包裹
**修复**:
```tsx
// 将使用 useSearchParams 的逻辑抽取为独立子组件
function SearchContent() {
  const params = useSearchParams()
  return <div>{params.get('q')}</div>
}
// 外层加 Suspense
export default function Page() {
  return <Suspense fallback={<Loading />}><SearchContent /></Suspense>
}
```
**防御规则**: 每次使用 `useSearchParams` 时检查是否有 Suspense 边界
