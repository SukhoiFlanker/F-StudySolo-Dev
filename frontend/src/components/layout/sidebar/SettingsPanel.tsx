'use client';

import { toast } from 'sonner';
import { PanelLeft, PanelRight } from 'lucide-react';
import {
  useSettingsStore,
  type AccentColor,
  type FontSize,
  type ThemeMode,
  type SidebarPosition,
} from '@/stores/use-settings-store';
import {
  ACCENT_OPTIONS,
  FONT_OPTIONS,
  THEME_OPTIONS,
} from '@/features/settings/options';

function handleChange(name: string, action: () => void) {
  action();
  toast.success('设置已保存', { description: `${name} 偏好已更新`, duration: 2000 });
}

export default function SettingsPanel() {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    glassEffect,
    setGlassEffect,
    autoSave,
    setAutoSave,
    showMinimap,
    setShowMinimap,
    sidebarPosition,
    setSidebarPosition,
  } = useSettingsStore();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3">
        {/* Theme mode */}
        <Section title="外观模式">
          <div className="flex gap-1.5">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('外观模式', () => setTheme(opt.value as ThemeMode))}
                className={`flex flex-1 flex-col items-center gap-1 rounded-sm border-2 px-1.5 py-2 text-[10px] font-bold font-serif transition-all shadow-[2px_2px_0px_rgba(28,25,23,1)] dark:shadow-[2px_2px_0px_rgba(168,162,158,1)] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:hover:shadow-[3px_3px_0px_rgba(168,162,158,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(28,25,23,1)] ${
                  theme === opt.value
                    ? 'border-stone-800 dark:border-stone-300 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'border-stone-400 dark:border-stone-600 bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-stone-400 node-paper-bg'
                }`}
              >
                <opt.icon className={`h-4 w-4 stroke-[2.5] ${theme === opt.value ? 'text-stone-800 dark:text-stone-200' : ''}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Accent color */}
        <Section title="主题色">
          <div className="flex flex-wrap gap-2">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('主题色', () => setAccentColor(opt.value as AccentColor))}
                className="group flex flex-col items-center gap-1"
              >
                <div
                  className={`h-7 w-7 rounded-sm border-2 transition-all ${
                    accentColor === opt.value ? 'scale-110 border-stone-800 dark:border-stone-200 shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:shadow-[3px_3px_0px_rgba(168,162,158,1)]' : 'border-stone-800 dark:border-stone-600 hover:-translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(28,25,23,1)] shadow-none'
                  }`}
                  style={{
                    backgroundColor: opt.color,
                  }}
                />
                <span className={`text-[9px] font-mono tracking-wider font-bold mt-1 ${accentColor === opt.value ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Font size */}
        <Section title="字体大小">
          <div className="flex gap-1 rounded-sm border-2 border-stone-800 dark:border-stone-400 bg-stone-100 dark:bg-zinc-900 p-1 shadow-[2px_2px_0px_rgba(28,25,23,1)] dark:shadow-[2px_2px_0px_rgba(168,162,158,1)] node-paper-bg">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('字体大小', () => setFontSize(opt.value as FontSize))}
                className={`flex-1 rounded-[2px] py-1.5 text-[10px] font-bold font-serif transition-colors ${
                  fontSize === opt.value
                    ? 'bg-stone-800 text-stone-50 dark:bg-stone-300 dark:text-stone-900 shadow-none'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Toggles */}
        <Section title="功能">
          <div className="space-y-2">
            <Toggle checked={glassEffect} onChange={(v) => handleChange('毛玻璃', () => setGlassEffect(v))} label="毛玻璃效果" />
            <Toggle checked={autoSave} onChange={(v) => handleChange('自动保存', () => setAutoSave(v))} label="自动保存" />
            <Toggle checked={showMinimap} onChange={(v) => handleChange('小地图', () => setShowMinimap(v))} label="显示小地图" />
          </div>
        </Section>

        {/* Sidebar position */}
        <Section title="菜单栏位置">
          <div className="flex gap-1.5">
            {([
              { value: 'left', label: '左侧', icon: PanelLeft },
              { value: 'right', label: '右侧', icon: PanelRight },
            ] as { value: SidebarPosition; label: string; icon: React.ElementType }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('菜单栏位置', () => setSidebarPosition(opt.value))}
                className={`flex flex-1 flex-col items-center gap-1 rounded-sm border-2 px-1.5 py-2 text-[10px] font-bold font-serif transition-all shadow-[2px_2px_0px_rgba(28,25,23,1)] dark:shadow-[2px_2px_0px_rgba(168,162,158,1)] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:hover:shadow-[3px_3px_0px_rgba(168,162,158,1)] ${
                  sidebarPosition === opt.value
                    ? 'border-stone-800 dark:border-stone-300 bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'border-stone-400 dark:border-stone-600 bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-stone-400 node-paper-bg'
                }`}
              >
                <opt.icon className={`h-4 w-4 stroke-[2.5] ${sidebarPosition === opt.value ? 'text-stone-800 dark:text-stone-200' : ''}`} />
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] text-muted-foreground/50">切换后立即生效，无需刷新</p>
        </Section>

        <p className="mt-3 text-center text-[9px] text-muted-foreground/50">
          设置自动保存至浏览器本地存储
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b-[1.5px] border-dashed border-stone-300 dark:border-stone-700 last:border-0 last:pb-0">
      <p className="mb-3 text-[11px] font-bold font-mono uppercase tracking-[0.2em] text-stone-800 dark:text-stone-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-xs font-serif font-bold text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-200/50 dark:hover:bg-zinc-800/50"
    >
      {label}
      <div
        className={`relative h-5 w-9 rounded-sm border-2 border-stone-800 dark:border-stone-400 transition-colors shadow-[1px_1px_0px_rgba(28,25,23,1)] ${
          checked ? 'bg-stone-800 dark:bg-stone-300' : 'bg-stone-200 dark:bg-zinc-800'
        }`}
      >
        <div
          className={`absolute top-[1px] h-3.5 w-3.5 rounded-sm border-[1.5px] bg-stone-50 transition-transform ${
            checked ? 'translate-x-[16px] border-stone-800' : 'translate-x-[2px] border-stone-400 dark:border-stone-600'
          }`}
        />
      </div>
    </button>
  );
}
