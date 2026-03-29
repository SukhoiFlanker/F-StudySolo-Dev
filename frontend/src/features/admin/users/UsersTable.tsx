import type { PaginatedUserList, UserListItem } from '@/types/admin';
import {
  EmptyState,
  Pagination,
  TableSkeletonRows,
  formatDateTime,
  maskEmail,
} from '@/features/admin/shared';
import { StatusBadgeWithDot, TierBadge } from './user-shared';

interface UsersTableProps {
  data: PaginatedUserList | null;
  loading: boolean;
  page: number;
  selectedUserId: string | null;
  onSelectUser: (user: UserListItem) => void;
  onPageChange: (page: number) => void;
}

export function UsersTable({
  data,
  loading,
  page,
  selectedUserId,
  onSelectUser,
  onPageChange,
}: UsersTableProps) {
  if (!loading && (!data || data.users.length === 0)) {
    return <EmptyState title="暂无用户数据" description="当前筛选条件下没有用户记录。" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['邮箱', '会员等级', '状态', '注册时间', '最后登录'].map((header) => (
                <th key={header} className="px-6 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableSkeletonRows rows={8} cols={5} />
            ) : (
              data?.users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`cursor-pointer transition-colors group ${
                    selectedUserId === user.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{maskEmail(user.email)}</td>
                  <td className="px-6 py-4">
                    <TierBadge tier={user.tier} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadgeWithDot isActive={user.is_active} />
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-500">{formatDateTime(user.created_at)}</td>
                  <td className="px-6 py-4 text-[13px] text-slate-500">{formatDateTime(user.last_login)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={data?.total_pages ?? 1}
        total={data?.total}
        loading={loading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
