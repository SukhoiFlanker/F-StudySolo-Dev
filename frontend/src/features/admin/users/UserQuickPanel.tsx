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
    <div className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-5 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-[#002045]">快速预览</h2>
      <div className="mt-5 space-y-4 text-sm">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">用户 ID</p>
          <p className="mt-1 text-[#002045]">{user.id}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">邮箱</p>
          <p className="mt-1 text-[#002045]">{user.email}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">会员等级</p>
          <div className="mt-1">
            <TierBadge tier={user.tier} />
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">账号状态</p>
          <div className="mt-1">
            <StatusBadgeWithDot isActive={user.is_active} />
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">注册时间</p>
          <p className="mt-1 text-[#002045]">{formatDateTime(user.created_at)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[#74777f]">最后登录</p>
          <p className="mt-1 text-[#002045]">{formatDateTime(user.last_login)}</p>
        </div>
      </div>

      <button
        onClick={() => router.push(`/admin-analysis/users/${user.id}`)}
        className="mt-6 w-full rounded-none border border-[#002045] bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
      >
        查看完整详情
      </button>
    </div>
  );
}
