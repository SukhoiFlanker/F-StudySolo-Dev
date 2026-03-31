import { useInView } from '../hooks/useInView';
import { Atom, Plug, Puzzle, Bot, BarChart3, Radio, Database, Lightbulb, Wrench, CheckCircle2 } from 'lucide-react';

const STATS = [
  { label: '前端 React 组件', value: '60+', icon: Atom, color: 'var(--accent-blue)' },
  { label: '后端 API 端点', value: '27+', icon: Plug, color: 'var(--accent-green)' },
  { label: '节点类型', value: '18', icon: Puzzle, color: 'var(--accent-purple)' },
  { label: 'AI 平台接入', value: '8', icon: Bot, color: 'var(--accent-rose)' },
  { label: '管理后台模块', value: '10', icon: BarChart3, color: 'var(--accent-amber)' },
  { label: 'SSE 事件类型', value: '7', icon: Radio, color: 'var(--accent-emerald)' },
  { label: '核心数据库表', value: '10+', icon: Database, color: 'var(--accent-blue)' },
  { label: '模型 SKU', value: '17+', icon: Lightbulb, color: 'var(--accent-purple)' },
];

const COMPLETED_FEATURES = [
  { name: 'DAG 执行引擎', desc: '自研拓扑排序调度，18 种节点类型' },
  { name: '自然语言生成工作流', desc: '意图识别、规划、画布操作' },
  { name: '画布交互（拖拉、连线）', desc: '@xyflow/react，支持 Undo/Redo' },
  { name: 'SSE 流式执行面板', desc: '7 种事件类型，链路追踪' },
  { name: '多模型路由与容灾', desc: '8 平台 3 策略自动切换' },
  { name: '社区节点共建（一期）', desc: '发布、浏览、Prompt 封装' },
  { name: '工作流社区共享与 Fork', desc: '发布、收藏、分叉体验' },
  { name: '用户认证与安全', desc: 'Canvas 验证码 + IP 锁定 + RLS' },
  { name: '管理后台与计费体系', desc: '10 模块，Free/Pro/Pro+/Ultra' },
  { name: '工作流数据双缓冲同步', desc: 'IndexedDB + Supabase 5s 节流' },
];

const IN_PROGRESS = [
  { name: 'MCP 协议接入', status: '开发中' },
  { name: '外部 API 节点', status: '开发中' },
  { name: '用户自有 API Key', status: '规划中' },
  { name: '社区节点内容审核', status: '规划中' },
];

const TECH_DOCS = [
  { label: '技术文档总数', value: '50+', desc: 'docs/ 目录完整架构记录' },
  { label: '节点 SOP 文档', value: '5篇', desc: '新增节点标准化流程' },
  { label: '新增节点文件数', value: '7个', desc: '后端 3 文件 + 前端 4 文件' },
];

export default function SystemStatus() {
  const [ref, inView] = useInView<HTMLDivElement>(0.1);

  return (
    <section id="status" className="grid-bg" style={{ padding: '40px 0 80px', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="label label-green" style={{ marginBottom: 20, display: 'inline-flex' }}>
            🚀 PRODUCTION LIVE · 系统现状
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
            不是原型，是
            <br />
            <span className="marker-highlight" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}>生产级运行系统</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            当前已完成生产环境部署，运行于阿里云 ECS。<br />
            以下是真实的系统工程数据。
          </p>
        </div>

        {/* Stats Grid */}
        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 48,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {STATS.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg-canvas)',
                  borderRadius: 20,
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  textAlign: 'center',
                  opacity: inView ? 1 : 0,
                  animation: inView ? `fadeUp 0.4s ease ${i * 0.06}s both` : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${stat.color}08`;
                  e.currentTarget.style.borderColor = `${stat.color}40`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-canvas)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <StatIcon size={36} color={stat.color} strokeWidth={1.5} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 36,
                  color: stat.color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.4,
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Columns: Completed + In Progress */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 40 }}>

          {/* Completed Features */}
          <div style={{
            background: 'var(--bg-canvas)',
            borderRadius: 24,
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-green)',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent-green)' }}>
                COMPLETED · {COMPLETED_FEATURES.length} MODULES
              </span>
            </div>
            <div style={{ padding: 8 }}>
              {COMPLETED_FEATURES.map(f => (
                <div key={f.name} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    color: 'var(--accent-green)',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* In Progress */}
            <div style={{
              background: 'var(--bg-canvas)',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              flex: 1,
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <Wrench size={16} color="var(--accent-amber)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent-amber)' }}>
                  IN PROGRESS
                </span>
              </div>
              <div style={{ padding: 8 }}>
                {IN_PROGRESS.map(f => (
                  <div key={f.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    gap: 8,
                  }}>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f.name}</div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: f.status === '开发中' ? 'var(--accent-amber)' : 'var(--text-dim)',
                      background: f.status === '开发中' ? '#fffbeb' : 'var(--bg-canvas)',
                      border: `1px solid ${f.status === '开发中' ? '#fde68a' : 'var(--border-subtle)'}`,
                      padding: '3px 8px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}>
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SOP System */}
            <div style={{
              background: 'var(--bg-canvas)',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              padding: 24,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}>
                SOP + SKILLS 文档驱动开发
              </div>
              {TECH_DOCS.map(doc => (
                <div key={doc.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{doc.desc}</div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 20,
                    color: 'var(--accent-blue)',
                  }}>
                    {doc.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification */}
        <div style={{
          background: 'var(--bg-canvas)',
          borderRadius: 20,
          border: '1px solid var(--border-subtle)',
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 24,
        }}>
          {[
            { check: '前端类型安全', tool: 'tsc --noEmit', status: '零错误', ok: true },
            { check: '前端单元测试', tool: 'Vitest', status: '全通过', ok: true },
            { check: '后端编译检查', tool: 'compileall', status: '无警告', ok: true },
            { check: '后端单元测试', tool: 'pytest', status: '全通过', ok: true },
            { check: '生产环境', tool: '阿里云 ECS', status: '运行中', ok: true },
          ].map(v => (
            <div key={v.check} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <CheckCircle2 color="var(--accent-green)" size={24} />
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}>{v.check}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--accent-green)',
                fontWeight: 600,
              }}>{v.status}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                marginTop: 2,
              }}>{v.tool}</div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 1100px) {
            #status > div > div:nth-child(3) {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 900px) {
            #status > div > div:nth-child(4) {
              grid-template-columns: 1fr !important;
            }
            #status > div > div:nth-child(5) {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
