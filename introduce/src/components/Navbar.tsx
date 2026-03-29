import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100,
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        backgroundColor: scrolled ? 'rgba(3,7,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px',
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
            letterSpacing: '0.02em',
          }}>
            Study<span style={{ color: 'var(--accent-green)' }}>Solo</span>
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Features', href: '#features' },
            { label: 'Architecture', href: '#arch' },
            { label: 'Pricing', href: '#pricing' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="label-green" style={{ gap: 6 }}>
            <span className="dot-live" />
            LIVE
          </span>
          <a
            href="https://studyflow.1037solo.com"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            打开工作流 ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
