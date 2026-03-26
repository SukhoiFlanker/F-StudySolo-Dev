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
    <div className="overflow-hidden rounded-none border border-[#c4c6cf] bg-[#f4f4f0] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#c4c6cf]">
              {['配置键', '配置值', '说明', '最后更新时间', '操作'].map((header) => (
                <th key={header} className="px-5 py-4 font-mono text-[10px] tracking-widest text-[#002045]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={6} cols={5} />
            ) : (
              configs.map((entry) => (
                <tr key={entry.key} className="border-b border-[#ddd8cf] align-top last:border-b-0">
                  <td className="px-5 py-4 font-mono text-xs text-[#002045]">{entry.key}</td>
                  <td className="px-5 py-4">
                    <textarea
                      value={draftValues[entry.key] ?? JSON.stringify(entry.value, null, 2)}
                      onChange={(event) => onChangeDraft(entry.key, event.target.value)}
                      rows={4}
                      className="w-full rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-3 font-mono text-xs text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-[#74777f]">{entry.description ?? '—'}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#74777f]">{formatDateTime(entry.updated_at)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onSave(entry)}
                      disabled={savingKey === entry.key}
                      className="rounded-none border border-[#002045] bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {savingKey === entry.key ? '保存中...' : '保存'}
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
