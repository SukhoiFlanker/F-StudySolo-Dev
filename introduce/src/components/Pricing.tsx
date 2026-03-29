import { useInView } from '../hooks/useInView';

const PLANS = [
  {
    id: 'free',
    name: '免费体验',
    price: '¥0',
    period: '',
    desc: '轻设体验，感受平台能力',
    color: 'var(--text-dim)',
    accent: 'var(--border-panel)',
    features: [
      { text: '基础工作流编排执行', included: true },
      { text: '社区优质工作流浏览', included: true },
      '15 种标准执行节点',
      { text: '低优模型路由配额', included: true },
      { text: '高优 AI Router', included: false },
      { text: '复杂逻辑节点（switch/loop）', included: false },
      { text: '工作流共享发布', included: false },
    ],
    cta: '开始免费体验',
    ctaStyle: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro 认证版',
    price: '¥29',
    period: '/月',
    desc: '日常自动化学习场景首选',
    color: 'var(--accent-green)',
    accent: 'var(--accent-green)',
    highlight: true,
    features: [
      '全部 18 种执行节点类型',
      '高优 AI Router 调用权',
      '复杂逻辑节点（switch / loop）',
      '工作流共享与社区发布',
      '邮件 + 站内双通道进度通知',
      '历史执行记录查询',
      { text: '独立资源通道', included: false },
    ],
    cta: '升级 Pro →',
    ctaStyle: 'primary',
    badge: 'POPULAR',
  },
  {
    id: 'proplus',
    name: 'Pro+ 极客版',
    price: '¥79',
    period: '/月',
    desc: '高频场景 + 私有化部署',
    color: 'var(--accent-cyan)',
    accent: 'var(--accent-cyan)',
    features: [
      '不限量 Qwen-MAX 并发推导',
      '全量管理员数据后台',
      '独立私有资源通道',
      '使用量统计与审计日志',
      '工作流 A/B 测试实验场',
      '优先技术支持响应',
      '自定义模型端点接入',
    ],
    cta: '联系获取',
    ctaStyle: 'secondary',
  },
];

function FeatureItem({ feature }: { feature: string | { text: string; included: boolean } }) {
  const text = typeof feature === 'string' ? feature : feature.text;
  const included = typeof feature === 'string' ? true : feature.included;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ color: included ? 'var(--accent-green)' : 'var(--text-dim)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {included ? '✓' : '○'}
      </span>
      <span style={{ fontSize: 13, color: included ? 'var(--text-secondary)' : 'var(--text-dim)', lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

export default function Pricing() {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <section id="pricing" ref={ref} style={{
      background: 'var(--bg-void)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '120px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 64, textAlign: 'center' }}>
          <div className="label-green" style={{ marginBottom: 20, justifyContent: 'center' }}>
            TRANSPARENT PRICING
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 52px)',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            透明定价，无隐藏费用
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
            不卖黑盒服务。基于底层模型调用成本透明核算。
            收益直接反哺算力采购，让高质量学习服务可持续运营。
          </p>
        </div>

        {/* Pricing Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'var(--border-subtle)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              background: plan.highlight ? 'var(--bg-surface)' : 'var(--bg-panel)',
              padding: '40px 32px',
              position: 'relative',
              borderTop: `3px solid ${plan.highlight ? plan.accent : 'var(--border-subtle)'}`,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -1,
                  right: 32,
                  background: 'var(--accent-green)',
                  color: 'var(--bg-void)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  padding: '3px 10px',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: plan.color,
                  letterSpacing: '0.12em',
                  marginBottom: 8,
                }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 42,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{plan.period}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{plan.desc}</div>
              </div>

              {/* Feature List */}
              <div style={{ flex: 1, marginBottom: 32 }}>
                {plan.features.map((f, i) => (
                  <FeatureItem key={i} feature={f} />
                ))}
              </div>

              {/* CTA */}
              <button
                className={plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px' }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: 32, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
          所有方案均不含平台级 AI API 成本，实际调用按量计费。竞赛期间 Pro 版本对参赛学生免费开放。
        </div>

      </div>
    </section>
  );
}
