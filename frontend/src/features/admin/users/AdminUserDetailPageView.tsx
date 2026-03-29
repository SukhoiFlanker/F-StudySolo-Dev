'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserDetail, updateUserRole, updateUserStatus } from '@/services/admin.service';
import type { TierValue, UserDetailResponse } from '@/types/admin';
import { ToastStack } from '@/features/admin/shared';
import { useToastQueue } from '@/hooks/use-toast-queue';
import { UserDetailLoading } from './UserDetailLoading';
import { UserDetailPanels } from './UserDetailPanels';

export function AdminUserDetailPageView() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toasts, pushToast, dismissToast } = useToastQueue();

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierValue>('free');

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserDetail(userId);
      setData(result);
      setSelectedTier(result.user.tier as TierValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户详情失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  async function handleStatusToggle() {
    if (!data) {
      return;
    }

    const confirmed = window.confirm(
      data.user.is_active ? `确认停用用户 ${data.user.email} 吗？` : `确认启用用户 ${data.user.email} 吗？`
    );
    if (!confirmed) {
      return;
    }

    setStatusLoading(true);
    try {
      const result = await updateUserStatus(userId, !data.user.is_active);
      setData((current) => (current ? { ...current, user: { ...current.user, is_active: result.is_active } } : current));
      pushToast('success', result.is_active ? '用户已启用' : '用户已停用');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : '更新用户状态失败');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleRoleChange() {
    if (!data) {
      return;
    }

    if (selectedTier === data.user.tier) {
      pushToast('error', '请选择新的会员等级');
      return;
    }

    setRoleLoading(true);
    try {
      const result = await updateUserRole(userId, selectedTier);
      setData((current) => (current ? { ...current, user: { ...current.user, tier: result.tier } } : current));
      pushToast('success', `会员等级已更新为 ${result.tier}`);
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : '更新会员等级失败');
    } finally {
      setRoleLoading(false);
    }
  }

  if (loading) {
    return <UserDetailLoading />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin-analysis/users')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          返回用户列表
        </button>
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-red-500">error</span>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => void fetchUser()} 
            className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/admin-analysis/users')}
          className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          aria-label="返回用户列表"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
        </button>
        
        <div>
          <h1 className="text-xl font-bold text-slate-900">{data.user.email}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-mono text-xs font-medium text-slate-400">ID: {data.user.id}</span>
          </p>
        </div>
      </div>

      <UserDetailPanels
        data={data}
        selectedTier={selectedTier}
        statusLoading={statusLoading}
        roleLoading={roleLoading}
        onSelectTier={setSelectedTier}
        onToggleStatus={() => void handleStatusToggle()}
        onApplyTier={() => void handleRoleChange()}
      />
    </div>
  );
}
