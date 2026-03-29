import { useInView } from '../hooks/useInView';

/* Architecture based strictly on actual system */
const STACK = [
  {
    tier: 'FRONTEND',
    port: ':2037',
    color: '#00d4ff',
    tech: 'Next.js 14 + React 19',
    items: ['App Router (SSR + CSR)', 'Zustand 状态管理', '@xyflow/react 工作流画布', 'Tailwind CSS v4', 'TypeScript 5.x'],
    note: 'Deployed as Node.js server (Nginx → :2037)',
  },
  {
    tier: 'BACKEND',
    port: ':2038',
    color: '#00ff88',
    tech: 'Python FastAPI',
    items: ['Uvicorn ASGI Server', 'SSE StreamingResponse', 'DAG Executor (自研)', 'Pydantic v2 数据校验', 'AI Router 分发层'],
    note: 'uvicorn --workers 2 (Nginx → /api/)',
  },
  {
    tier: 'DATABASE',
    port: 'PG',
    color: '#7c3aed',
    tech: 'Supabase PostgreSQL',
    items: ['Row Level Security (RLS)', 'Supabase Auth (JWT)', 'profiles / workflows / nodes 表', 'knowledge_bases 知识库', 'IP 登录锁定记录表'],
    note: 'Supabase Cloud (us-east-1)',
  },
  {
    tier: 'INFRASTRUCTURE',
    port: 'ECS',
    color: '#ff6b35',
    tech: 'Aliyun ECS + Nginx',
    items: ['Nginx 统一反向代理网关', '1C/2G 轻量云服务器', 'PM2 进程管理', 'SSL/HTTPS 全站加密', '*.1037solo.com 泛域名'],
    note: '1037solo.com ecosystem',
  },
];

const ROUTING = [
  { from: 'studyflow.1037solo.com/', to: 'Next.js :2037', protocol: 'HTTP PROXY', active: true },
  { from: 'studyflow.1037solo.com/api/', to: 'FastAPI :2038', protocol: 'HTTP PROXY', active: true },
  { from: '1037solo.com/introduce/', to: 'Vite SPA (Static)', protocol: 'STATIC FILE', active: true },
  { from: '→ Supabase', to: 'PostgreSQL DB', protocol: 'SUPABASE SDK', active: true },
];

export default function Architecture() {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <section id="arch" style={{
      background: 'var(--bg-void)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '120px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div className="label-cyan" style={{ marginBottom: 20 }}>
            SYSTEM ARCHITECTURE
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
            Polyglot Monorepo 架构
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480 }}>
            多语言单仓库架构，前后端完全独立部署。生产环境运行于阿里云 ECS，Nginx 统一网关分发。
          </p>
        </div>

        {/* Nginx Routing Table */}
        <div ref={ref} style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 1,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
              nginx.conf — 生产路由映射
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <span className="dot-live" style={{ marginRight: 6 }} />
              <span style={{ color: 'var(--accent-green)' }}>PRODUCTION</span>
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Request Path', 'Routes To', 'Protocol', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px',
                      textAlign: 'left',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROUTING.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 24px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>{r.from}</td>
                    <td style={{ padding: '14px 24px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>{r.to}</td>
                    <td style={{ padding: '14px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>{r.protocol}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--accent-green)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <span className="dot-live" style={{ width: 5, height: 5 }} />
                        ONLINE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stack Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--border-subtle)',
        }}>
          {STACK.map((s, i) => (
            <div key={s.tier} style={{
              background: 'var(--bg-panel)',
              padding: 28,
              borderTop: `3px solid ${s.color}`,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
            }}>
              {/* Tier Label + Port */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, letterSpacing: '0.12em' }}>
                  {s.tier}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--bg-void)',
                  background: s.color,
                  padding: '2px 8px',
                }}>
                  {s.port}
                </span>
              </div>

              {/* Tech Name */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--text-primary)',
                marginBottom: 20,
                lineHeight: 1.3,
              }}>
                {s.tech}
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {s.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: s.color, flexShrink: 0, marginTop: 2 }}>›</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 14,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '0.05em',
              }}>
                {s.note}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
