'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/services/admin.service';
import type {
  NoticeStatusFilter,
  NoticeTypeFilter,
  PaginatedNoticeList,
} from '@/types/admin';
import {
  AdminSelect,
  PageHeader,
  buildPaginationParams,
} from '@/features/admin/shared';
import { AdminNoticesTable } from './AdminNoticesTable';

const TYPE_OPTIONS: { value: NoticeTypeFilter; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'system', label: '系统公告' },
  { value: 'feature', label: '功能更新' },
  { value: 'promotion', label: '活动推广' },
  { value: 'education', label: '教育通知' },
  { value: 'changelog', label: '更新日志' },
  { value: 'maintenance', label: '维护公告' },
];

const STATUS_OPTIONS: { value: NoticeStatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
];

export function AdminNoticesPageView() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedNoticeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<NoticeTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<NoticeStatusFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  const queryString = useMemo(() => {
    const params = buildPaginationParams(page, 20);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    return params.toString();
  }, [page, statusFilter, typeFilter]);

  async function fetchNotices() {
    setLoading(true);
    setError(null);
    try {
      const result = await adminFetch<PaginatedNoticeList>(`/notices?${queryString}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载公告失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  async function handlePublish(noticeId: string) {
    setActionLoading(noticeId);
    try {
      await adminFetch(`/notices/${noticeId}/publish`, { method: 'POST' });
      await fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布公告失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(noticeId: string, title: string) {
    const confirmed = window.confirm(`确认删除公告“${title}”吗？删除后不可恢复。`);
    if (!confirmed) return;

    setActionLoading(noticeId);
    try {
      await adminFetch(`/notices/${noticeId}`, { method: 'DELETE' });
      await fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除公告失败');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="公告管理"
        description={data ? `共 ${data.total.toLocaleString('zh-CN')} 条公告` : '查看和维护站内公告'}
        action={
          <button
            onClick={() => router.push('/admin-analysis/notices/create')}
            className="flex items-center gap-2 rounded-none bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建公告
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <AdminSelect
          value={typeFilter}
          options={TYPE_OPTIONS}
          onChange={(event) => setTypeFilter(event.target.value as NoticeTypeFilter)}
        />

        <AdminSelect
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(event) => setStatusFilter(event.target.value as NoticeStatusFilter)}
        />
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <span>{error}</span>
          <button onClick={() => void fetchNotices()} className="ml-4 text-xs text-red-700 underline hover:text-red-800">
            重试
          </button>
        </div>
      ) : null}

      <AdminNoticesTable
        data={data}
        loading={loading}
        page={page}
        actionLoading={actionLoading}
        onPageChange={setPage}
        onPublish={(id) => {
          void handlePublish(id);
        }}
        onDelete={(id, title) => {
          void handleDelete(id, title);
        }}
      />
    </div>
  );
}
