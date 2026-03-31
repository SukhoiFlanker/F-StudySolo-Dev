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
    <div className="rounded-md border border-border bg-card p-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="material-symbols-outlined text-[20px] text-muted-foreground/60">person</span>
        <h2 className="text-[14px] font-semibold text-foreground">快速预览</h2>
      </div>
      
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">用户 ID</p>
          <p className="mt-1 font-mono text-[13px] font-medium text-muted-foreground">{user.id}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">邮箱</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">会员等级</p>
          <div className="mt-1.5">
            <TierBadge tier={user.tier} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">账号状态</p>
          <div className="mt-1.5">
            <StatusBadgeWithDot isActive={user.is_active} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">注册时间</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">{formatDateTime(user.created_at)}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground/60 uppercase">最后登录</p>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">{formatDateTime(user.last_login)}</p>
        </div>
      </div>

      <button
        onClick={() => router.push(`/admin-analysis/users/${user.id}`)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-[13px] font-medium text-primary transition-all hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        查看完整详情
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  );
}
