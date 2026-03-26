'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getConfigs, updateConfig } from '@/services/admin.service';
import type { ConfigEntry } from '@/types/admin';
import { EmptyState, PageHeader } from '@/features/admin/shared';
import { ConfigEditorTable } from './ConfigEditorTable';

export function AdminConfigPageView() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('{}');
  const [newDescription, setNewDescription] = useState('');

  const configCountText = useMemo(
    () => (configs.length > 0 ? `当前共 ${configs.length} 项系统配置` : '支持读取、修改和新增系统配置'),
    [configs.length]
  );

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConfigs();
      setConfigs(result.configs);
      setDraftValues(
        Object.fromEntries(
          result.configs.map((entry) => [entry.key, JSON.stringify(entry.value, null, 2)])
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载系统配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfigs();
  }, [fetchConfigs]);

  async function handleSave(entry: ConfigEntry) {
    const confirmed = window.confirm(`确认保存配置 ${entry.key} 吗？`);
    if (!confirmed) return;

    setSavingKey(entry.key);
    try {
      const nextValue = JSON.parse(draftValues[entry.key] ?? 'null');
      await updateConfig(entry.key, nextValue, entry.description);
      await fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存配置失败，请确认 JSON 格式正确');
    } finally {
      setSavingKey(null);
    }
  }

  async function handleCreate() {
    if (!newKey.trim()) {
      setError('请填写配置键。');
      return;
    }

    const confirmed = window.confirm(`确认新建配置 ${newKey.trim()} 吗？`);
    if (!confirmed) return;

    setSavingKey(newKey.trim());
    try {
      const parsedValue = JSON.parse(newValue);
      await updateConfig(newKey.trim(), parsedValue, newDescription.trim() || null);
      setNewKey('');
      setNewValue('{}');
      setNewDescription('');
      await fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : '新建配置失败，请确认 JSON 格式正确');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-[#f4f4f0] px-8 py-8">
      <PageHeader title="系统配置" description={configCountText} />

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => void fetchConfigs()} className="text-xs underline">
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      <ConfigEditorTable
        configs={configs}
        loading={loading}
        draftValues={draftValues}
        savingKey={savingKey}
        onChangeDraft={(key, value) => setDraftValues((current) => ({ ...current, [key]: value }))}
        onSave={(entry) => {
          void handleSave(entry);
        }}
      />

      <section className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-5 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-[#002045]">新建配置</h2>
        <p className="mt-2 text-sm text-[#74777f]">配置值需填写为合法 JSON，可直接写对象、数组、布尔值或字符串。</p>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
            placeholder="配置键，例如 feature.admin.notice"
            className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 text-sm text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
          />
          <input
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            placeholder="配置说明"
            className="rounded-none border border-[#c4c6cf] bg-[#f4f4f0] px-3 py-2 text-sm text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
          />
        </div>
        <textarea
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          rows={6}
          className="mt-4 w-full rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-3 font-mono text-xs text-[#002045] shadow-sm focus:border-[#002045] focus:outline-none"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <EmptyState title="危险操作提醒" description="系统配置变更会直接影响后台行为，保存前请确认键名和值符合预期。" />
          <button
            onClick={() => void handleCreate()}
            disabled={savingKey === newKey.trim()}
            className="shrink-0 rounded-none border border-[#002045] bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {savingKey === newKey.trim() ? '创建中...' : '新建配置'}
          </button>
        </div>
      </section>
    </div>
  );
}
