'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';

const FADE_UP = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

export interface AdminSelectOption {
  value: string;
  label: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow = '后台管理协议',
}: PageHeaderProps) {
  return (
    <motion.div
      {...FADE_UP}
      className="mb-8 flex flex-col gap-4 border-l-8 border-[#002045] pl-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold tracking-[0.28em] text-[#74777f]">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-black tracking-tight text-[#002045] md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#74777f]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <motion.section
      {...FADE_UP}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative overflow-hidden border border-[#c4c6cf] bg-[#f4f4f0] p-6 shadow-sm"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(0,32,69,0.05), rgba(0,32,69,0.05) 1px, transparent 1px, transparent 12px)',
        }}
      />
      <div className="absolute left-0 top-0 h-1 w-16 bg-[#002045]" />
      <div className="relative z-10">
        <p className="mb-3 inline-block border-b border-[#002045]/10 pb-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#002045]/60">
          {label}
        </p>
        <p className="font-serif text-3xl font-black text-[#002045] md:text-4xl">{value}</p>
        {sub ? (
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-[#74777f]">{sub}</p>
        ) : null}
      </div>
    </motion.section>
  );
}

interface AdminSelectProps {
  value: string;
  options: AdminSelectOption[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export function AdminSelect({
  value,
  options,
  onChange,
  className = '',
}: AdminSelectProps) {
  return (
    <label className={`relative block min-w-[180px] ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="peer w-full appearance-none border border-[#c4c6cf] bg-[#f4f4f0] px-4 py-3 pr-11 font-['Space_Grotesk'] text-[15px] font-medium text-[#002045] shadow-sm outline-none transition-colors hover:bg-[#efeeea] focus:border-[#002045]"
      >
        {options.map((option) => (
          <option key={`${option.value || 'empty'}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#002045]/70 transition-transform peer-focus:-translate-y-[55%]">
        expand_more
      </span>
    </label>
  );
}

interface TableSkeletonRowsProps {
  rows: number;
  cols: number;
}

export function TableSkeletonRows({ rows, cols }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[#c4c6cf]/30">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-5 py-4">
              <div className="h-4 w-20 animate-pulse bg-[#002045]/10" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1 && total == null) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-[#c4c6cf] bg-[#f4f4f0] px-5 py-4">
      <span className="font-mono text-[10px] tracking-[0.16em] text-[#74777f]">
        第 {page} / {totalPages} 页{total != null ? ` · 共 ${total.toLocaleString('zh-CN')} 条` : ''}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="border border-[#c4c6cf] bg-[#f4f4f0] px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-[#002045] transition-colors hover:bg-[#ebe9df] disabled:cursor-not-allowed disabled:opacity-30"
        >
          上一页
        </button>
        <button
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="border border-[#002045] bg-[#002045] px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  label: string;
  className?: string;
}

export function StatusBadge({ label, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] ${className}`}
    >
      {label}
    </span>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <motion.div
      {...FADE_UP}
      className="relative overflow-hidden border border-[#c4c6cf] bg-[#f4f4f0] px-6 py-12 text-center shadow-sm"
    >
      <div className="absolute left-4 top-4 h-5 w-5 border-l border-t border-[#002045]/25" />
      <div className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-[#002045]/25" />
      <p className="font-serif text-lg font-bold text-[#002045]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#74777f]">{description}</p>
    </motion.div>
  );
}

interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  message: string;
}

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  const colorMap = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-[#002045]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`flex items-center gap-4 border border-l-4 p-4 font-mono text-sm tracking-wide shadow-sm ${colorMap[toast.kind] ?? colorMap.info}`}
          style={{
            borderLeftColor:
              toast.kind === 'error' ? '#ef4444' : toast.kind === 'success' ? '#10b981' : '#002045',
          }}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="material-symbols-outlined text-lg text-current opacity-50 transition-opacity hover:opacity-100"
          >
            close
          </button>
        </motion.div>
      ))}
    </div>
  );
}
