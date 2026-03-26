'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/services/admin.service';
import type {
  MemberTierFilter as TierFilter,
  PaginatedMemberList,
  RevenueStats,
  TierStats,
} from '@/types/admin';
import { AdminSelect, EmptyState, KpiCard, PageHeader, Pagination, formatDate } from '@/features/admin/shared';
import { TierBadge } from '@/features/admin/users/user-shared';

const TIER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: '', label: '全部付费会员' },
  { value: 'pro', label: '专业版' },
  { value: 'pro_plus', label: '专业增强版' },
  { value: 'ultra', label: '旗舰版' },
];

export function AdminMembersPageView() {
  const [tierStats, setTierStats] = useState<TierStats | null>(null);
  const [memberList, setMemberList] = useState<PaginatedMemberList | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState<TierFilter>('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tierParam = tierFilter ? `&tier=${tierFilter}` : '';
      const [stats, list, rev] = await Promise.all([
        adminFetch<TierStats>('/members/stats'),
        adminFetch<PaginatedMemberList>(`/members/list?page=${page}&page_size=20${tierParam}`),
        adminFetch<RevenueStats>('/members/revenue'),
      ]);
      setTierStats(stats);
      setMemberList(list);
      setRevenue(rev);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载会员数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader
        title="会员管理"
        description={
          tierStats ? `共 ${tierStats.total.toLocaleString('zh-CN')} 位用户，其中 ${tierStats.paid_total.toLocaleString('zh-CN')} 位为付费用户` : '查看会员分布与收入概况'
        }
      />

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => void fetchAll()} className="text-xs underline">
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      {tierStats ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard label="免费版用户" value={tierStats.free.toLocaleString()} />
          <KpiCard label="专业版用户" value={tierStats.pro.toLocaleString()} />
          <KpiCard label="专业增强版" value={tierStats.pro_plus.toLocaleString()} />
          <KpiCard label="旗舰版用户" value={tierStats.ultra.toLocaleString()} />
        </div>
      ) : null}

      {revenue ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard label="月经常性收入" value={`¥ ${revenue.mrr.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} />
          <KpiCard label="年经常性收入" value={`¥ ${revenue.arr.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} />
          <KpiCard label="ARPU" value={`¥ ${revenue.arpu.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`} sub={`有效订阅 ${revenue.active_subscriptions}`} />
        </div>
      ) : null}

      <section className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#002045]">付费会员列表</h2>
            <p className="mt-2 text-sm text-[#74777f]">按会员等级筛选付费用户。</p>
          </div>
          <AdminSelect
            value={tierFilter}
            options={TIER_OPTIONS}
            onChange={(event) => {
              setTierFilter(event.target.value as TierFilter);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#c4c6cf]">
                {['邮箱', '会员等级', '订阅状态', '订阅开始', '订阅结束'].map((header) => (
                  <th key={header} className="px-4 py-3 font-mono text-[10px] tracking-widest text-[#002045]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, row) => (
                  <tr key={row} className="border-b border-[#ddd8cf]">
                    {Array.from({ length: 5 }).map((_, col) => (
                      <td key={col} className="px-4 py-3">
                        <div className="h-3 w-24 animate-pulse bg-[#e1ded1]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : memberList && memberList.members.length > 0 ? (
                memberList.members.map((member) => (
                  <tr key={member.user_id} className="border-b border-[#ddd8cf] last:border-b-0">
                    <td className="px-4 py-3 text-sm text-[#002045]">{member.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={member.tier} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#74777f]">{member.subscription_status ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#74777f]">{formatDate(member.subscription_start)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#74777f]">{formatDate(member.subscription_end)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6">
                    <EmptyState title="暂无付费会员" description="当前筛选条件下没有付费会员记录。" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={memberList?.total_pages ?? 1}
            total={memberList?.total}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
