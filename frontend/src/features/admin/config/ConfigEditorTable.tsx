import type { ConfigEntry } from '@/types/admin';
import { EmptyState, TableSkeletonRows, formatDateTime } from '@/features/admin/shared';

interface ConfigEditorTableProps {
  configs: ConfigEntry[];
  loading: boolean;
  draftValues: Record<string, string>;
  savingKey: string | null;
  onChangeDraft: (key: string, value: string) => void;
  onSave: (entry: ConfigEntry) => void;
}

export function ConfigEditorTable({
  configs,
  loading,
  draftValues,
  savingKey,
  onChangeDraft,
  onSave,
}: ConfigEditorTableProps) {
  if (!loading && configs.length === 0) {
    return <EmptyState title="暂无系统配置" description="当前 `ss_system_config` 还没有配置项，可在下方新建配置。" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {['配置键', '配置值', '说明', '最后更新', '操作'].map((header) => (
                <th key={header} className="px-6 py-4 text-[11px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableSkeletonRows rows={6} cols={5} />
            ) : (
              configs.map((entry) => (
                <tr key={entry.key} className="align-top transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
                      <span className="font-mono text-sm font-medium text-slate-900">{entry.key}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <textarea
                      value={draftValues[entry.key] ?? JSON.stringify(entry.value, null, 2)}
                      onChange={(event) => onChangeDraft(entry.key, event.target.value)}
                      rows={4}
                      className="w-full min-w-[300px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-block max-w-[200px] text-sm text-slate-500">
                      {entry.description ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {formatDateTime(entry.updated_at)}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button
                      onClick={() => onSave(entry)}
                      disabled={savingKey === entry.key}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingKey === entry.key ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          保存中...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">save</span>
                          保存
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
