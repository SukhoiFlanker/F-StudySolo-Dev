'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUsers } from '@/services/admin.service';
import type { PaginatedUserList, StatusFilter, TierFilter, UserListItem } from '@/types/admin';
import { EmptyState, PageHeader, buildPaginationParams } from '@/features/admin/shared';
import { UserQuickPanel } from './UserQuickPanel';
import { UsersTable } from './UsersTable';

const TIER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: 'all', label: '全部等级' },
  { value: 'free', label: '免费版' },
  { value: 'pro', label: '专业版' },
  { value: 'pro_plus', label: '专业增强版' },
  { value: 'ultra', label: '旗舰版' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '停用' },
];

export function AdminUsersPageView() {
  const [data, setData] = useState<PaginatedUserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const queryParams = useMemo(() => {
    const params = buildPaginationParams(page, 20);
    if (search) params.set('search', search);
    if (tierFilter !== 'all') params.set('tier', tierFilter);
    if (statusFilter !== 'all') params.set('is_active', statusFilter === 'active' ? 'true' : 'false');
    return params;
  }, [page, search, statusFilter, tierFilter]);

  const fetchUserList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers(queryParams);
      setData(result);
      setSelectedUser((current) => result.users.find((user) => user.id === current?.id) ?? result.users[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchUserList();
  }, [fetchUserList]);

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader
        title="用户管理"
        description={data ? `共 ${data.total.toLocaleString('zh-CN')} 位注册用户` : '按邮箱、等级和状态筛选用户'}
      />

      <section className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr,1fr,1fr,auto]">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="按邮箱搜索用户"
            className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 text-sm text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
          />
          <select
            value={tierFilter}
            onChange={(event) => {
              setTierFilter(event.target.value as TierFilter);
              setPage(1);
            }}
            className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 text-sm text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
          >
            {TIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 text-sm text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch(searchInput.trim());
              setPage(1);
            }}
            className="rounded-none border border-[#002045] bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            查询
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => void fetchUserList()} className="text-xs underline">
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !data ? (
        <EmptyState title="暂无用户数据" description="当前无法获取用户列表，请稍后重试。" />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr),360px]">
          <UsersTable
            data={data}
            loading={loading}
            page={page}
            selectedUserId={selectedUser?.id ?? null}
            onSelectUser={setSelectedUser}
            onPageChange={setPage}
          />
          <UserQuickPanel user={selectedUser} />
        </div>
      )}
    </div>
  );
}
