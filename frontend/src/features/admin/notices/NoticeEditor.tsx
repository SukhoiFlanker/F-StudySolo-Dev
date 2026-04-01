'use client';

import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AdminSelect } from '@/features/admin/shared';

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
    'w-full bg-card border border-border rounded-md px-4 py-2.5 text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition-all';
  const errorClass = 'mt-1.5 flex items-center gap-1 text-[12px] text-destructive font-medium';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 flex items-center gap-1 text-[13px] font-medium text-foreground">
          标题 <span className="text-destructive">*</span>
        </label>
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="请输入公告标题" maxLength={200} className={inputClass} />
        {errors.title ? <p className={errorClass}><span className="material-symbols-outlined text-[14px]">error</span>{errors.title}</p> : null}
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground/60 font-medium">{title.length}/200</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-1 text-[13px] font-medium text-foreground">公告类型</label>
          <AdminSelect value={type} options={TYPE_OPTIONS} onChange={(event) => setType(event.target.value as NoticeType)} />
        </div>
        <div>
          <label className="mb-2 flex items-center gap-1 text-[13px] font-medium text-foreground">状态</label>
          <AdminSelect value={status} options={STATUS_OPTIONS} onChange={(event) => setStatus(event.target.value as NoticeStatus)} />
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1 text-[13px] font-medium text-foreground">失效时间</label>
        <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className={inputClass} />
        {errors.expires_at ? <p className={errorClass}><span className="material-symbols-outlined text-[14px]">error</span>{errors.expires_at}</p> : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1 text-[13px] font-medium text-foreground">
            公告正文 <span className="text-destructive">*</span>
          </label>
          <button type="button" onClick={() => setPreview((value) => !value)} className="flex items-center gap-1 text-[12px] font-medium text-primary transition-colors hover:text-primary/80">
            <span className="material-symbols-outlined text-[16px]">{preview ? 'edit' : 'visibility'}</span>
            {preview ? '返回编辑' : '预览内容'}
          </button>
        </div>

        {preview ? (
          <div className="prose min-h-[300px] max-w-none rounded-md border border-border bg-secondary p-6 text-[13px] text-foreground">
            {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="text-muted-foreground italic">暂无预览内容。</p>}
          </div>
        ) : (
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="请使用 Markdown 编写公告内容" rows={14} className={`${inputClass} min-h-[300px] resize-y py-3 font-mono`} />
        )}
        {errors.content ? <p className={errorClass}><span className="material-symbols-outlined text-[14px]">error</span>{errors.content}</p> : null}
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground/60 font-medium">{content.length}/10000</p>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-[13px] font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
          {isLoading ? (
            <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>保存中...</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">save</span>{submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
}
