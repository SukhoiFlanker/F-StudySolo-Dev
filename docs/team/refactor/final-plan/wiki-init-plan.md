# Wiki 初始化详细计划

> 属于 Phase 5 的 Task 5.2（队友 A 主导）
> 前置依赖：Phase 3（前端架构重构）完成
> 预估时间：5-7 天
> GitHub Issue：[#10](https://github.com/AIMFllys/StudySolo-Dev/issues/10)

---

## 方案确认

**采用 Next.js Route Group 方案，嵌入主 `frontend/`**（`wiki/` 独立子项目方案已废弃）

---

## Task W1：创建 Route Group 骨架

```bash
# 在 frontend/src/app/ 下创建
frontend/src/app/(wiki)/wiki/
├── layout.tsx         ← Wiki 专属布局
├── page.tsx           ← 首页（文档目录）
└── [...slug]/
    └── page.tsx       ← 动态文档路由
```

**layout.tsx 要点**：

```tsx
// frontend/src/app/(wiki)/wiki/layout.tsx
export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wiki-layout">
      <WikiSidebar />
      <main className="wiki-content">
        {children}
      </main>
      <WikiTOC />  {/* 右侧目录，桌面端显示 */}
    </div>
  )
}
```

> [!WARNING]
> Route Group `(wiki)` 不出现在 URL 中。实际访问路径是 `/wiki/...`，不是 `/(wiki)/wiki/...`。
> `layout.tsx` 绝对不要 `import` 主应用的 Sidebar，否则 Wiki 会继承主应用导航。

---

## Task W2：创建 Wiki 专属组件

```
frontend/src/components/wiki/
├── WikiSidebar.tsx         ← 文档目录导航（支持多级折叠）
├── WikiSearch.tsx          ← 简单文档搜索（初版可用 Ctrl+F 替代）
├── WikiTOC.tsx             ← 右侧标题锚点目录（桌面端）
└── WikiMDXComponents.tsx   ← MDX 自定义组件（代码高亮、警告框等）
```

**WikiSidebar 数据源**：

```tsx
// 初版：从静态配置读取
const WIKI_NAV = [
  { title: '快速开始', slug: 'getting-started/quick-start' },
  { title: '核心概念', slug: 'getting-started/concepts' },
  {
    title: '使用指南',
    children: [
      { title: '创建工作流', slug: 'guides/creating-workflows' },
      { title: '使用节点', slug: 'guides/using-nodes' },
    ]
  },
  { title: 'API 参考', slug: 'api/reference' },
]
```

---

## Task W3：Markdown 渲染方案

**采用 `next-mdx-remote` + `gray-matter`（已在主前端使用过类似依赖）**

```tsx
// frontend/src/app/(wiki)/wiki/[...slug]/page.tsx
import { compileMDX } from 'next-mdx-remote/rsc'
import { WikiMDXComponents } from '@/components/wiki/WikiMDXComponents'
import { getDocContent } from '@/lib/wiki'

export default async function WikiPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  const source = await getDocContent(slug)  // 读取 docs/wiki-content/xxx.md
  
  const { content, frontmatter } = await compileMDX({
    source,
    components: WikiMDXComponents,
    options: { parseFrontmatter: true }
  })
  
  return <article>{content}</article>
}

// 静态生成（推荐）
export async function generateStaticParams() {
  return getAllDocSlugs()  // 从 docs/wiki-content/ 扫描所有 .md 文件
}
```

> [!NOTE]
> `generateStaticParams` 让所有 Wiki 页面在构建时静态生成，性能最优，SEO 友好。

---

## Task W4：内容目录初始化

```
docs/wiki-content/
├── getting-started/
│   ├── quick-start.md        ← 5 分钟上手 StudySolo
│   └── concepts.md           ← 工作流、节点、AI 对话核心概念
├── guides/
│   ├── creating-workflows.md ← 创建第一个工作流
│   └── using-nodes.md        ← 标准节点使用说明
└── api/
    └── reference.md          ← API 参考（可暂时为空壳）
```

**初始上线至少 3 篇可读文档**（`quick-start.md`、`creating-workflows.md`、`using-nodes.md`）

---

## Task W5：Wiki 样式系统

Wiki 需要与主应用保持一致的 Design Token，但有独立的布局宽度：

```css
/* 主应用：左 sidebar 240px + 内容区 flex-1 */
/* Wiki：左 sidebar 260px + 内容 最大 768px + 右 TOC 200px */

.wiki-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 768px) 200px;
  gap: 2rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
```

---

## Task W6：CI 文档同步（Week 2）

```yaml
# .github/workflows/wiki-check.yml
# 检查 docs/wiki-content/ 下的 markdown 文件格式合规
on:
  push:
    paths: ['docs/wiki-content/**']
  pull_request:
    paths: ['docs/wiki-content/**']

jobs:
  lint-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check markdown
        run: npx markdownlint-cli2 "docs/wiki-content/**/*.md"
```

---

## 完成标志

- [ ] `/wiki` 可在本地访问，不继承主应用 Sidebar
- [ ] 至少 3 篇文档可正常渲染（Markdown）
- [ ] WikiSidebar 可正常导航
- [ ] `generateStaticParams` 已配置（静态生成）
- [ ] `docs/wiki-content/` 目录已建立并提交初始 3 篇文档
- [ ] Nginx 配置已就绪（注释状态保留在配置中）

---

## 队友 A 注意事项

> [!CAUTION]
> 1. **不要**安装 `contentlayer`——该库已停止维护
> 2. **不要**重复安装 `react-markdown`——主前端已有，检查 package.json
> 3. `docs/wiki-content/` 的内容由**全体成员**维护，队友 A 只负责渲染层
> 4. Wiki 的 Auth 不需要单独实现，复用主应用的登录态即可（同一个 Next.js 进程）
