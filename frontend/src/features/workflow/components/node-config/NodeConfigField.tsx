'use client';

import type { NodeConfigFieldSchema } from '@/types';

interface NodeConfigFieldProps {
  field: NodeConfigFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function NodeConfigField({ field, value, onChange }: NodeConfigFieldProps) {
  const commonClassName = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40';

  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{field.label}</span>
        {field.description ? (
          <span className="text-[11px] text-muted-foreground">{field.description}</span>
        ) : null}
      </div>

      {field.type === 'textarea' ? (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={`${commonClassName} min-h-24 resize-y`}
        />
      ) : null}

      {field.type === 'text' ? (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={commonClassName}
        />
      ) : null}

      {field.type === 'number' ? (
        <input
          type="number"
          value={typeof value === 'number' ? value : Number(value ?? field.default ?? 0)}
          onChange={(event) => onChange(Number(event.target.value))}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          className={commonClassName}
        />
      ) : null}

      {field.type === 'select' ? (
        <select
          value={String(value ?? field.default ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className={commonClassName}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === 'boolean' ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <input
            id={`cfg-${field.key}`}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="text-sm text-foreground">启用</span>
        </div>
      ) : null}
    </label>
  );
}
