'use client';

import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type NoticeType = 'system' | 'feature' | 'promotion' | 'education' | 'changelog' | 'maintenance';
export type NoticeStatus = 'draft' | 'published' | 'archived';

export interface NoticeFormData {
  title: string;
  content: string;
  type: NoticeType;
  status: NoticeStatus;
  expires_at: string;
}

interface NoticeEditorProps {
  initialData?: Partial<NoticeFormData>;
  onSubmit: (data: NoticeFormData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

const TYPE_OPTIONS: { value: NoticeType; label: string }[] = [
  { value: 'system', label: '系统公告' },
  { value: 'feature', label: '功能更新' },
  { value: 'promotion', label: '活动推广' },
  { value: 'education', label: '教育通知' },
  { value: 'changelog', label: '更新日志' },
  { value: 'maintenance', label: '维护公告' },
];

const STATUS_OPTIONS: { value: NoticeStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
];

export default function NoticeEditor({
  initialData,
  onSubmit,
  submitLabel = '保存',
  isLoading = false,
}: NoticeEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [type, setType] = useState<NoticeType>(initialData?.type ?? 'system');
  const [status, setStatus] = useState<NoticeStatus>(initialData?.status ?? 'draft');
  const [expiresAt, setExpiresAt] = useState(initialData?.expires_at ?? '');
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = '标题不能为空';
    else if (title.trim().length > 200) nextErrors.title = '标题长度不能超过 200 个字符';
    if (!content.trim()) nextErrors.content = '正文不能为空';
    else if (content.trim().length > 10000) nextErrors.content = '正文长度不能超过 10,000 个字符';
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime())) nextErrors.expires_at = '时间格式无效';
      else if (date <= new Date()) nextErrors.expires_at = '失效时间必须晚于当前时间';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [content, expiresAt, title]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      type,
      status,
      expires_at: expiresAt,
    });
  };

  const inputClass =
    'w-full bg-[#f4f4f0] border border-[#c4c6cf] rounded-none px-3 py-2 text-[#002045] text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#002045] transition shadow-sm';
  const errorClass = 'mt-1 text-xs text-red-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#002045]">
          标题 <span className="text-red-700">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="请输入公告标题"
          maxLength={200}
          className={inputClass}
        />
        {errors.title ? <p className={errorClass}>{errors.title}</p> : null}
        <p className="mt-1 text-xs text-[#74777f]">{title.length}/200</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#002045]">公告类型</label>
          <select value={type} onChange={(event) => setType(event.target.value as NoticeType)} className={inputClass}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#002045]">状态</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as NoticeStatus)} className={inputClass}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium tracking-wider text-[#002045]">失效时间</label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className={inputClass}
        />
        {errors.expires_at ? <p className={errorClass}>{errors.expires_at}</p> : null}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium tracking-wider text-[#002045]">
            公告正文 <span className="text-red-700">*</span>
          </label>
          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className="text-xs text-[#002045] transition-colors hover:underline"
          >
            {preview ? '返回编辑' : '预览内容'}
          </button>
        </div>

        {preview ? (
          <div className="prose min-h-[300px] max-w-none rounded-none border border-[#c4c6cf] bg-[#f4f4f0] p-4 text-sm text-[#002045] shadow-sm">
            {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="text-[#74777f]">暂无预览内容。</p>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="请使用 Markdown 编写公告内容"
            rows={14}
            className={`${inputClass} min-h-[300px] resize-y py-3`}
          />
        )}
        {errors.content ? <p className={errorClass}>{errors.content}</p> : null}
        <p className="mt-1 text-xs text-[#74777f]">{content.length}/10000</p>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#c4c6cf] pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-none bg-[#002045] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
