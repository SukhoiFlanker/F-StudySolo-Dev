import { Sparkles, Brain, FileText, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { rainColumns, stars } from '@/features/auth/constants';
import { AuthLogo } from './AuthLogo';

const brandFeaturePills: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: '智能大纲' },
  { icon: Brain, label: '知识提炼' },
  { icon: FileText, label: '总结归纳' },
  { icon: Layers, label: '闪卡生成' },
];

export function AuthBrandPanel() {
  return (
    <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#050B1D] items-center justify-center">
      <div className="absolute inset-0" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animation: `twinkle ${star.duration} ease-in-out ${star.delay} infinite, drift ${star.duration} ease-in-out ${star.delay} infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {rainColumns.map((column) => (
          <span
            key={column.id}
            className="absolute text-[10px] font-mono text-primary/20 select-none"
            style={{
              left: column.left,
              top: 0,
              animation: `codeRain ${column.duration} linear ${column.delay} infinite`,
            }}
          >
            {column.char}
          </span>
        ))}
      </div>

      <div
        className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'rgba(99, 102, 241, 0.3)', filter: 'blur(100px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center px-12 max-w-md">
        <div className="flex items-center justify-center mb-8">
          <AuthLogo size="lg" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 leading-tight mb-4">
          AI 驱动的学习工作流平台
        </h1>
        <p className="text-sm text-white/50 leading-relaxed mb-8">
          一句话生成完整学习流程，从大纲到知识提炼，从总结到闪卡，全链路 AI 协作。
        </p>
        <div className="grid grid-cols-2 gap-3">
          {brandFeaturePills.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/60 text-xs"
            >
              <item.icon className="w-4 h-4 text-primary/70" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
