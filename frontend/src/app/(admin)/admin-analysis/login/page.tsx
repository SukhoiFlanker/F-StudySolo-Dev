'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/services/admin.service';
import { useAdminStore } from '@/stores/use-admin-store';

const LOCK_FAILS_KEY = 'admin_lock_fails';
const LOCK_WINDOW_MS = 3 * 60 * 1000;
const LOCK_LIMIT = 5;

function loadRecentFails() {
  const now = Date.now();
  const fails = JSON.parse(localStorage.getItem(LOCK_FAILS_KEY) || '[]') as number[];
  const recentFails = fails.filter((timestamp) => now - timestamp < LOCK_WINDOW_MS);
  localStorage.setItem(LOCK_FAILS_KEY, JSON.stringify(recentFails));
  return recentFails;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdmin } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (loadRecentFails().length >= LOCK_LIMIT) {
        window.location.replace('/404');
      }
    } catch {
      // Ignore malformed storage payloads.
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const data = await adminLogin(username, password);
      localStorage.removeItem(LOCK_FAILS_KEY);
      setAdmin(data.admin);
      router.push(data.admin.force_change_password ? '/admin-analysis/change-password' : '/admin-analysis');
    } catch {
      const fails = JSON.parse(localStorage.getItem(LOCK_FAILS_KEY) || '[]') as number[];
      fails.push(Date.now());
      localStorage.setItem(LOCK_FAILS_KEY, JSON.stringify(fails));
      window.location.replace('/404');
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f4f4f0] font-[Work_Sans,sans-serif]">
      <section className="relative hidden w-1/2 overflow-hidden border-r border-[#c4c6cf] px-16 xl:px-24 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 hatched-bg opacity-50" />
        <div className="relative z-10 max-w-2xl space-y-10">
          <div className="relative flex h-32 w-32 items-center justify-center border-2 border-[#002045] bg-[#f4f4f0]">
            <div className="absolute right-0 top-0 h-8 w-8 border-b-2 border-l-2 border-[#002045]" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-r-2 border-t-2 border-[#002045]" />
            <span className="font-serif text-6xl font-black italic text-[#002045]">S</span>
            <span className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-[0.6em] text-[#002045]/60">
              严谨
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="font-serif text-6xl font-bold leading-tight tracking-tighter text-[#002045]">
              数据主权
              <br />
              <span className="italic text-[#1A365D]">学术自由的基础</span>
            </h1>
            <p className="border-l-4 border-[#002045] pl-6 text-xl font-medium leading-relaxed text-[#2f312e]">
              StudySolo 后台强调最小权限、可追踪治理和稳定的研究工作流，为管理操作提供清晰的审计边界。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="border-t border-[#c4c6cf] pt-4">
              <span className="block font-mono text-xs font-bold uppercase text-[#002045]">安全协议</span>
              <p className="mt-2 font-mono text-sm text-[#43474e]">AES-256 端到端加密</p>
            </div>
            <div className="border-t border-[#c4c6cf] pt-4">
              <span className="block font-mono text-xs font-bold uppercase text-[#002045]">访问权限</span>
              <p className="mt-2 font-mono text-sm text-[#43474e]">受限学术节点</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex w-full items-center justify-center bg-[#f4f4f0] px-8 lg:w-1/2 lg:px-20">
        <div className="w-full max-w-md space-y-10">
          <header className="space-y-3">
            <span className="inline-block border-b border-[#002045]/10 pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#002045]/60">身份验证管理单元</span>
            <h2 className="font-serif text-4xl font-black tracking-tight text-[#002045]">访问授权登录</h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <label className="block space-y-2 px-3">
              <span className="block font-mono text-xs font-bold uppercase text-[#002045]/60">管理账号</span>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={loading}
                  required
                  placeholder="输入管理员账号"
                  className="w-full border-0 border-b-2 border-[#c4c6cf] bg-transparent px-0 py-4 text-lg placeholder:text-[#74777f]/40 focus:border-[#002045] focus:ring-0"
                />
                <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#74777f]/40">
                  person_search
                </span>
              </div>
            </label>

            <label className="block space-y-2 px-3">
              <span className="block font-mono text-xs font-bold uppercase text-[#002045]/60">登录密码</span>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                  placeholder="请输入登录密码"
                  className="w-full border-0 border-b-2 border-[#c4c6cf] bg-transparent px-0 py-4 text-lg tracking-[0.3em] placeholder:text-[#74777f]/40 focus:border-[#002045] focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[#74777f]/40 transition-colors hover:text-[#002045]"
                  tabIndex={-1}
                >
                  {showPassword ? 'visibility' : 'key'}
                </button>
              </div>
            </label>

            <label className="flex items-center gap-3 px-3 font-mono text-xs font-bold tracking-widest text-[#43474e]">
              <input
                className="h-4 w-4 rounded-none border-2 border-[#002045] bg-transparent text-[#002045] focus:ring-[#002045]"
                type="checkbox"
              />
              保持活跃会话
            </label>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex w-full items-center justify-between bg-[#002045] px-8 py-5 text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="font-serif text-lg font-bold tracking-wide">{loading ? '身份校验中...' : '进入后台'}</span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  fingerprint
                </span>
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </span>
            </button>
          </form>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div className="space-y-4 text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#74777f]">
              本系统的访问行为会记录到审计日志。
              <br />
              未经授权的访问尝试将被限制并追踪。
            </p>
            <div className="flex gap-4">
              <div className="h-1.5 w-1.5 rotate-45 bg-[#002045]/20" />
              <div className="h-1.5 w-1.5 rotate-45 bg-[#002045]/20" />
              <div className="h-1.5 w-1.5 rotate-45 bg-[#002045]/60" />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-[#c4c6cf] border-l-4 border-l-[#002045] bg-[#f4f4f0] p-4 shadow-sm">
            <span className="material-symbols-outlined text-2xl text-[#002045]">shield_lock</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#002045]">节点状态</span>
              <span className="font-mono text-[10px] tracking-wider text-emerald-700">加密在线</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
