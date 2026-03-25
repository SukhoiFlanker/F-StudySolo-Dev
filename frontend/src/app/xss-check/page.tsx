import { readFile } from 'fs/promises';
import path from 'path';
import NodeMarkdownOutput from '@/features/workflow/components/nodes/NodeMarkdownOutput';

async function loadFixture() {
  const fixturePath = path.join(
    process.cwd(),
    '..',
    'docs',
    'xss验收示例-2026-03-25.md',
  );
  return readFile(fixturePath, 'utf-8');
}

export default async function XssCheckPage() {
  const content = await loadFixture();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">XSS 本地验收页</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            这个页面会直接使用工作流节点的 Markdown 渲染组件来显示
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              docs/xss验收示例-2026-03-25.md
            </code>
            的内容。
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            验收时请打开浏览器 Console，确认页面正常显示普通 Markdown，且控制台里不会出现任何
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              xss-check-*
            </code>
            字符串。
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <NodeMarkdownOutput content={content} />
        </section>
      </div>
    </main>
  );
}
