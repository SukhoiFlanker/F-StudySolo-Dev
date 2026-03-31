import { useInView } from '../hooks/useInView';
import { 
  BrainCircuit, Waves, Zap, Moon, Bean, Cloud, Gem, Flame, 
  Target, Banknote, Lock, RefreshCcw, TimerOff, TrendingDown 
} from 'lucide-react';

const AI_PLATFORMS = [
  { name: 'DeepSeek', models: 'V3 / R1', icon: BrainCircuit, mode: '原生接入', color: '#1a6bd0', usage: '深度推理 / 分析类节�? },
  { name: '通义千问（百炼）', models: 'Turbo / Plus / Max / Qwen3', icon: Waves, mode: '原生 + 七牛代理', color: '#6c47ff', usage: '格式输出 / 内容生成 / 规划' },
  { name: '智谱 GLM', models: 'Flash / GLM-4 / 4.5 / 4.7', icon: Zap, mode: '原生接入', color: '#1976d2', usage: 'OCR / 深度搜索 / 多模�? },
  { name: '月之暗面 Kimi', models: '8K / 128K / K2 / K2.5', icon: Moon, mode: '原生 + 七牛代理', color: '#7c3aed', usage: '超长文本 / 文档分析' },
  { name: '豆包（火山引擎）', models: 'Pro-32K / 256K / Seed 2', icon: Bean, mode: '原生 + 七牛代理', color: '#059669', usage: '长上下文 / 代码生成' },
  { name: '七牛�?, models: '多厂商代理通道', icon: Cloud, mode: '代理降成�?, color: '#d97706', usage: '成本优化路由 / 灾备' },
  { name: '硅基流动', models: 'Qwen2.5-72B', icon: Gem, mode: '代理接入', color: '#0891b2', usage: '免费用户分流 / 并发弹�? },
  { name: '火山引擎', models: 'Doubao 系列', icon: Flame, mode: '原生接入', color: '#dc2626', usage: 'TTS / 多模态生�? },
];

const ROUTING_STRATEGIES = [
  {
    id: 'native_first',
    name: 'native_first',
    title: '原生优先',
    desc: '直接调用大模型原�?API，优先追求性能和稳定�?,
    icon: Target,
    color: 'var(--accent-blue)',
  },
  {
    id: 'proxy_first',
    name: 'proxy_first',
    title: '代理优先',
    desc: '通过七牛�?硅基低价代理通道，最大幅度降�?API 成本',
    icon: Banknote,
    color: 'var(--accent-green)',
  },
  {
    id: 'capability_fixed',
    name: 'capability_fixed',
    title: '能力固定',
    desc: '某些节点的模型由能力决定，如 OCR 专用 GLM、长文本专用 Kimi',
    icon: Lock,
    color: 'var(--accent-purple)',
  },
];

export default function AIRouter() {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <section id="ai-router" className="grid-bg" style={{ padding: '40px 0 80px', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="label label-blue" style={{ marginBottom: 20, display: 'inline-flex' }}>
            AI MODEL ROUTER · 8 PLATFORMS
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            8 �?AI 平台
            <br />
            <span className="marker-highlight" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}>智能路由 · 多级容灾</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            不依赖单一模型。后端统一 AI Router 对接 8 个主流平台，
            每个节点配置 2-3 个候选模型，单平台宕机自动切换�?          </p>
        </div>

        {/* Routing Architecture Diagram */}
        <div ref={ref} style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid var(--border-subtle)',
          padding: 40,
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Layer 3 & 4 visual */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--bg-canvas)',
              borderRadius: 16,
              border: '2px solid var(--accent-blue)',
              padding: '12px 32px',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--accent-blue)',
              marginBottom: 12,
            }}>
              Layer 2 �?DAG Executor�?8 种节点）
            </div>
            <div style={{ fontSize: 24, color: 'var(--text-dim)', marginBottom: 12 }}>�?/div>
            <div style={{
              display: 'inline-block',
              background: '#fff7ed',
              borderRadius: 16,
              border: '2px solid var(--accent-amber)',
              padding: '12px 32px',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--accent-amber)',
              marginBottom: 24,
            }}>
              Layer 3 �?AI Router（路由分发层�?            </div>
          </div>

          {/* Routing Strategies */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            {ROUTING_STRATEGIES.map(strategy => {
              const StrategyIcon = strategy.icon;
              return (
                <div key={strategy.id} style={{
                  background: 'var(--bg-canvas)',
                  borderRadius: 16,
                  border: `1px solid ${strategy.color}30`,
                  padding: 20,
                  textAlign: 'center',
                }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                    <StrategyIcon size={32} color={strategy.color} strokeWidth={1.5} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: strategy.color,
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                    textTransform: 'uppercase'
                  }}>
                    {strategy.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>
                    {strategy.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {strategy.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 24, textAlign: 'center', color: 'var(--text-dim)', marginBottom: 24 }}>�?/div>

          {/* AI Platform Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {AI_PLATFORMS.map((platform, i) => {
              const PlatformIcon = platform.icon;
              return (
                <div
                  key={platform.name}
                  style={{
                    background: `${platform.color}08`,
                    borderRadius: 16,
                    border: `1px solid ${platform.color}25`,
                    padding: '16px 20px',
                    opacity: inView ? 1 : 0,
                    animation: inView ? `fadeUp 0.4s ease ${i * 0.08}s both` : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${platform.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <PlatformIcon size={24} color={platform.color} strokeWidth={2} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {platform.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: platform.color, marginBottom: 8, letterSpacing: '0.03em' }}>
                    {platform.models}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {platform.usage}
                  </div>
                  <div style={{
                    marginTop: 8,
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: `${platform.color}15`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: platform.color,
                    fontWeight: 600,
                  }}>
                    {platform.mode}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failover Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          {[
            { icon: RefreshCcw, title: '自动故障切换', desc: '单平台宕机时，自动切换至备�?SKU，用户无感知', value: '2-3 SKU / 节点', color: 'var(--accent-blue)' },
            { icon: TimerOff, title: '超时保护', desc: 'DeepSeek 高峰�?8秒超�?�?自动切换百炼 qwen-plus', value: '< 8s 超时', color: 'var(--accent-rose)' },
            { icon: TrendingDown, title: '成本优化', desc: '免费用户路由 qwen-turbo，成本低�?¥0.0003/K Token', value: '10x 成本降低', color: 'var(--accent-green)' },
          ].map(item => {
            const InfoIcon = item.icon;
            return (
              <div key={item.title} style={{
                background: '#ffffff',
                borderRadius: 20,
                border: '1px solid var(--border-subtle)',
                padding: 28,
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ marginBottom: 16 }}>
                  <InfoIcon size={32} color={item.color} strokeWidth={1.5} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: item.color,
                  marginBottom: 8,
                  letterSpacing: '0.05em',
                }}>{item.value}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1100px) {
            #ai-router > div > div:nth-child(3) > div > div:last-child {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 768px) {
            #ai-router > div > div:nth-child(3) {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
