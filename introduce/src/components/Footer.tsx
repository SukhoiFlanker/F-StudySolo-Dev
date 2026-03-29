export default function Footer() {
  const links = {
    Product: [
      { label: '工作流操作台', href: 'https://studyflow.1037solo.com' },
      { label: '平台官方文档', href: 'https://docs.1037solo.com' },
      { label: 'DAG 执行原理', href: '#workflow-demo' },
      { label: '定价方案', href: '#pricing' },
    ],
    Project: [
      { label: 'GitHub 源码', href: 'https://github.com/AIMFllys/StudySolo' },
      { label: '竞赛说明书', href: '#' },
      { label: '架构文档', href: '#arch' },
      { label: '1037Solo 生态', href: 'https://1037solo.com' },
    ],
    Tech: [
      { label: 'Next.js 14', href: 'https://nextjs.org' },
      { label: 'FastAPI', href: 'https://fastapi.tiangolo.com' },
      { label: 'Supabase', href: 'https://supabase.io' },
      { label: '@xyflow/react', href: 'https://reactflow.dev' },
    ],
  };

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px 40px' }}>

        {/* Top Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 80, marginBottom: 64, flexWrap: 'wrap' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 28,
                height: 28,
                border: '1px solid rgba(0,255,136,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img src={`${import.meta.env.BASE_URL}StudySolo.png`} alt="Logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--text-primary)',
              }}>
                Study<span style={{ color: 'var(--accent-green)' }}>Solo</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              华中科技大学 AI 智能体大赛参赛项目。
              将个人碎片化学习整合升级为系统化、工程化的知识生产流水线。
            </p>
            {/* System Status */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              padding: '16px 20px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}>
                SYSTEM STATUS
              </div>
              {[
                { name: 'API Gateway', status: 'ONLINE' },
                { name: 'AI Router', status: 'ONLINE' },
                { name: 'DAG Engine', status: 'ONLINE' },
              ].map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="dot-live" style={{ width: 5, height: 5 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-green)' }}>{s.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}>
                  {category}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-green)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ marginBottom: 32 }} />

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
            © 2026 1037Solo Team · HUST AI Agent Competition · All rights reserved
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
            Built with React 19 · FastAPI · Supabase · Deployed on Aliyun ECS
          </span>
        </div>
      </div>
    </footer>
  );
}
