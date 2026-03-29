import { useRouter } from 'next/navigation';
import type { UserListItem } from '@/types/admin';
import { EmptyState, formatDateTime } from '@/features/admin/shared';
import { StatusBadgeWithDot, TierBadge } from './user-shared';

interface UserQuickPanelProps {
  user: UserListItem | null;
}

export function UserQuickPanel({ user }: UserQuickPanelProps) {
  const router = useRouter();

  if (!user) {
    return <EmptyState title="请选择用户" description="点击左侧表格中的用户后，可在此处查看快速信息。" />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="material-symbols-outlined text-[20px] text-slate-400">person</span>
        <h2 className="text-base font-bold text-slate-900">快速预览</h2>
      </div>
      
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">用户 ID</p>
          <p className="mt-1 font-mono text-sm font-medium text-slate-700">{user.id}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">邮箱</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{user.email}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">会员等级</p>
          <div className="mt-1.5">
            <TierBadge tier={user.tier} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">账号状态</p>
          <div className="mt-1.5">
            <StatusBadgeWithDot isActive={user.is_active} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">注册时间</p>
          <p className="mt-1 text-[13px] font-medium text-slate-600">{formatDateTime(user.created_at)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">最后登录</p>
          <p className="mt-1 text-[13px] font-medium text-slate-600">{formatDateTime(user.last_login)}</p>
        </div>
      </div>

      <button
        onClick={() => router.push(`/admin-analysis/users/${user.id}`)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-500/20 transition-all hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        查看完整详情
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  );
}
