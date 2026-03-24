'use client';

import { Puzzle, Download, Check, ExternalLink } from 'lucide-react';

/** 模拟数据 — 后端 API 就绪后替换 */
const MOCK_PLUGINS = [
  {
    id: 'plugin-1',
    name: 'Notion 同步',
    description: '将工作流结果自动同步到 Notion 数据库',
    installed: true,
    version: '1.2.0',
    author: 'StudySolo',
  },
  {
    id: 'plugin-2',
    name: 'Anki 导出器',
    description: '闪卡节点自动导出为 Anki 卡组',
    installed: false,
    version: '0.9.1',
    author: '社区',
  },
  {
    id: 'plugin-3',
    name: 'PDF 解析器',
    description: '上传 PDF 文件并自动解析内容为知识节点',
    installed: false,
    version: '1.0.3',
    author: 'StudySolo',
  },
  {
    id: 'plugin-4',
    name: 'Zotero 连接器',
    description: '从 Zotero 导入文献，自动生成阅读笔记',
    installed: true,
    version: '0.8.0',
    author: '社区',
  },
];

export default function PluginsPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto px-2 py-2">
        <p className="mb-3 px-1 text-[10px] text-muted-foreground">
          安装插件扩展工作流能力
        </p>
        <div className="space-y-2">
          {MOCK_PLUGINS.map((plugin) => (
            <div
              key={plugin.id}
              className="rounded-md border-2 border-stone-800 dark:border-stone-400 bg-stone-50/90 dark:bg-zinc-900/90 p-3 shadow-[2px_2px_0px_rgba(28,25,23,0.15)] transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:hover:shadow-[3px_3px_0px_rgba(168,162,158,1)] node-paper-bg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-stone-800 dark:border-stone-400 bg-stone-200 dark:bg-zinc-800 shadow-[1px_1px_0px_rgba(28,25,23,1)] dark:shadow-[1px_1px_0px_rgba(168,162,158,1)] text-stone-800 dark:text-stone-300">
                    <Puzzle className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold font-serif text-stone-800 dark:text-stone-200">{plugin.name}</p>
                    <p className="text-[10px] font-mono tracking-wider text-stone-500">v{plugin.version} <span className="opacity-50">·</span> {plugin.author}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest border-2 shadow-[2px_2px_0px_rgba(28,25,23,1)] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(28,25,23,1)] active:translate-y-[2px] active:shadow-none ${
                    plugin.installed
                      ? 'border-emerald-700 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-400'
                      : 'border-stone-800 dark:border-stone-400 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {plugin.installed ? (
                    <>
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                      已安装
                    </>
                  ) : (
                    <>
                      <Download className="h-2.5 w-2.5 stroke-[2.5]" />
                      安装
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 pt-2 border-t-[1.5px] border-dashed border-stone-300 dark:border-stone-700 text-[10px] font-serif leading-snug text-stone-600 dark:text-stone-400">{plugin.description}</p>
            </div>
          ))}
        </div>
        <a
          href="#"
          className="mt-3 flex items-center justify-center gap-1 py-2 text-[10px] text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          浏览更多插件
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}
