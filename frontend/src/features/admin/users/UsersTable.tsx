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
    <div className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#c4c6cf]">
              {['邮箱', '会员等级', '状态', '注册时间', '最后登录'].map((header) => (
                <th key={header} className="px-5 py-4 font-mono text-[10px] tracking-widest text-[#002045]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={8} cols={5} />
            ) : (
              data?.users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`cursor-pointer border-b border-[#ddd8cf] transition-colors last:border-b-0 ${
                    selectedUserId === user.id ? 'bg-[#ebe9df]' : 'hover:bg-[#ebe9df]'
                  }`}
                >
                  <td className="px-5 py-4 text-sm text-[#002045]">{maskEmail(user.email)}</td>
                  <td className="px-5 py-4">
                    <TierBadge tier={user.tier} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadgeWithDot isActive={user.is_active} />
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#74777f]">{formatDateTime(user.created_at)}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#74777f]">{formatDateTime(user.last_login)}</td>
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
