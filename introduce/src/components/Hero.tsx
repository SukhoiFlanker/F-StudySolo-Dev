import { useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';

/* === MOUSE PARALLAX HOOK === */
function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setPos({ x, y });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
}

/* === ANIMATED COUNTER === */
function Counter({ to, suffix = '', duration = 2000 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView<HTMLSpanElement>(0.5);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [inView]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* === TICKER ITEMS === */
const TICKER_ITEMS = [
  '18 exectuion node types', 'DAG topology sort engine', 'SSE real-time streaming',
  'DeepSeek V3 router', 'Qwen-MAX parallel execution', 'RLS row-level security',
  'FastAPI async backend', 'Next.js 14 SSR frontend', 'Supabase Postgres DB',
  'Multi-tenant isolation', 'HUST AI Agent Competition', 'Open Source on GitHub',
];

const STATS = [
  { label: 'Execution Nodes', value: 18, suffix: '' },
  { label: 'AI Models Routed', value: 8, suffix: '+' },
  { label: 'Workflow Steps', value: 12, suffix: '+' },
  { label: 'Response Latency', value: 800, suffix: 'ms' },
];

interface HeroProps {
  onStart: () => void;
  onGuide: () => void;
}

export default function Hero({ onStart, onGuide }: HeroProps) {
  const parallax = useParallax();
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTitleVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="grid-bg"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      {/* Parallax Background Glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
        transition: 'transform 0.1s ease-out',
      }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Status Bar */}
      <div style={{ position: 'absolute', top: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div className="label-green">
          <span className="dot-live" />
          SIGNAL: CONNECTED · HUST AI AGENT COMPETITION 2025
        </div>
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900 }}>

        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-dim)',
          letterSpacing: '0.15em',
          marginBottom: 32,
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          {'>'} STUDYSOLO v2.0 — AI WORKFLOW ENGINE
        </div>

        {/* Main Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(48px, 8vw, 88px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: 16,
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
        }}>
          把学习
          <br />
          <span style={{ color: 'var(--accent-green)' }}>变成系统</span>
        </h1>

        {/* Subtitle - terminal style */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(13px, 2vw, 16px)',
          color: 'var(--accent-cyan)',
          marginBottom: 40,
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s',
          letterSpacing: '0.02em',
        }}>
          {'> '}18 nodes · 8 AI platforms · SSE real-time streaming · RLS security
        </div>

        {/* Description */}
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 560,
          margin: '0 auto 48px',
          lineHeight: 1.7,
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}>
          专为华科 AI 智能体大赛打造。不是对话框，是真实的 DAG 算子引擎。
          用一句自然语言，驱动数十个节点自动串联执行完整学习工作流。
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.4s',
        }}>
          <button className="btn-primary" onClick={onStart} style={{ fontSize: 15, padding: '14px 36px' }}>
            立即体验平台 →
          </button>
          <button className="btn-secondary" onClick={onGuide} style={{ fontSize: 15, padding: '14px 36px' }}>
            查看 GitHub 源码
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: 80,
        width: '100%',
        maxWidth: 900,
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'var(--border-subtle)',
        opacity: titleVisible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.5s',
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-panel)',
            padding: '24px 20px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div className="counter-number" style={{ fontSize: 32, marginBottom: 6 }}>
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-panel)',
        padding: '10px 0',
        overflow: 'hidden',
      }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0 32px',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: 'var(--accent-green)', marginRight: 12 }}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
