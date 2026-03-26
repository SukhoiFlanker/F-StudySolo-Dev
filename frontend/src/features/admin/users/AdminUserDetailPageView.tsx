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
          className="flex items-center gap-2 text-[#74777f] hover:text-[#002045] text-sm transition-colors"
        >
          返回用户列表
        </button>
        <div className="rounded-none px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => void fetchUser()} className="text-red-700 hover:text-red-800 underline text-xs ml-4">
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

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin-analysis/users')}
          className="flex items-center gap-2 text-[#74777f] hover:text-[#002045] text-sm transition-colors"
        >
          返回
        </button>
        <div>
          <h1 className="text-[#002045] text-xl font-bold">{data.user.email}</h1>
          <p className="text-[#74777f] text-sm mt-0.5">用户 ID：{data.user.id}</p>
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
