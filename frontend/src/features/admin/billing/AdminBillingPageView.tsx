'use client';

import { EmptyState, PageHeader } from '@/features/admin/shared';

const DEFERRED_ITEMS = [
  {
    label: '范围状态',
    value: '延后实施',
    description: '本期不新增 billing API、数据库表或统计口径。',
  },
  {
    label: '当前策略',
    value: '保持占位',
    description: '不再继续维护 mock 收入数据，避免与真实后端继续漂移。',
  },
  {
    label: '后续入口',
    value: '下一阶段',
    description: '待 dashboard、users、config、audit 稳定后再启动计费建设。',
  },
];

export function AdminBillingPageView() {
  return (
    <div className="mx-auto min-h-full max-w-6xl space-y-8 px-8 py-8 md:px-12">
      <PageHeader
        title="计费中心"
        description="计费与收入统计不在 Wave 1 范围内，本阶段仅保留中文占位页与后续实施约束。"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {DEFERRED_ITEMS.map((item) => (
          <section
            key={item.label}
            className="border border-[#c4c6cf] bg-[#f4f4f0] p-6 shadow-sm"
          >
            <p className="font-mono text-[10px] tracking-[0.2em] text-stone-500">
              {item.label}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-bold text-[#002045]">
              {item.value}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#43474e]">
              {item.description}
            </p>
          </section>
        ))}
      </div>

      <section className="border border-[#c4c6cf] bg-[#f4f4f0] p-8 shadow-sm">
        <EmptyState
          title="计费页暂不开放"
          description="如需进入下一阶段，应先明确 Supabase 账单相关表结构、收入口径、导出需求与权限边界。"
        />
      </section>
    </div>
  );
}
