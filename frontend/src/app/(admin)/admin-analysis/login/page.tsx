'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/services/admin.service'
import { useAdminStore } from '@/stores/use-admin-store'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setAdmin } = useAdminStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isBanned, setIsBanned] = useState(false)

  // ── 安全机制: 挂载时检测尝试次数 ──
  useEffect(() => {
    try {
      const fails = JSON.parse(localStorage.getItem('admin_lock_fails') || '[]')
      const now = Date.now()
      // 保留最近 3 分钟内的失败记录
      const recentFails = fails.filter((t: number) => now - t < 3 * 60 * 1000)
      localStorage.setItem('admin_lock_fails', JSON.stringify(recentFails))
      
      // 如果 3 分钟内错误 5 次，直接物理级封锁页面及渲染
      if (recentFails.length >= 5) {
        setIsBanned(true)
        window.location.replace('/404')
      }
    } catch {
      // 忽略解析解析异常
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || isBanned) return

    setLoading(true)

    try {
      const data = await adminLogin(username, password)
      
      // 成功登录，清除失败记录
      localStorage.removeItem('admin_lock_fails')
      
      setAdmin(data.admin)
      if (data.admin.force_change_password) {
        router.push('/admin-analysis/change-password')
      } else {
        router.push('/admin-analysis')
      }
    } catch {
      // ── "零容错"防爬虫策略 ──
      // 只要报错 (不论 401 还是超时)，一律立刻踢飞到 404
      const fails = JSON.parse(localStorage.getItem('admin_lock_fails') || '[]')
      fails.push(Date.now())
      localStorage.setItem('admin_lock_fails', JSON.stringify(fails))
      
      // 直接改变地址栏，破坏 SPA 路由，让爬虫脚本卡死
      window.location.replace('/404')
      // 注意: 这里故意不重置 loading=false，使其保持禁用，直到页面跳转销毁
    }
  }

  // 如果处于封禁状态，渲染为空以杜绝任何嗅探
  if (isBanned) return null

  return (
    <div className="min-h-screen flex academic-grid overflow-hidden font-[Work_Sans,sans-serif]">
      {/* ── Left: Brand Visual Area ── */}
      <section className="hidden lg:flex w-1/2 flex-col justify-center px-16 xl:px-24 relative overflow-hidden border-r border-[#c4c6cf]/10">
        {/* Hatched background */}
        <div className="absolute inset-0 hatched-bg -z-10" />

        <div className="space-y-12 max-w-2xl relative z-10">
          {/* Mathematical Logo */}
          <div className="relative w-32 h-32 border-2 border-[#002045] p-4 flex items-center justify-center bg-[#FAF9F5]/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-[#002045]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-t-2 border-r-2 border-[#002045]" />
            <span className="font-serif text-6xl font-black italic text-[#002045] drop-shadow-sm">S</span>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#002045]/60 rotate-90 tracking-[0.6em]">
              PRECISION
            </div>
          </div>

          {/* Hero Copy */}
          <div className="space-y-6">
            <h1 className="font-serif text-6xl font-bold text-[#002045] leading-tight tracking-tighter drop-shadow-sm">
              数据主权<br />
              <span className="italic text-[#1A365D]">学术自由的基础</span>
            </h1>
            <p className="text-xl text-[#2f312e] leading-relaxed opacity-90 border-l-4 border-[#002045] pl-6 font-medium">
              StudySolo 不仅仅是一个管理后台。它是一个受数字主权保护的知识堡垒，致力于保障全球学术研究的私密性与独立性。
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t border-[#c4c6cf]/50 pt-4">
              <span className="font-mono text-xs text-[#002045] uppercase block mb-2 font-bold">安全协议</span>
              <p className="font-mono text-sm text-[#43474e]">AES-256 E2EE Standard</p>
            </div>
            <div className="border-t border-[#c4c6cf]/50 pt-4">
              <span className="font-mono text-xs text-[#002045] uppercase block mb-2 font-bold">访问权限</span>
              <p className="font-mono text-sm text-[#43474e]">Restricted Academic Node</p>
            </div>
          </div>
        </div>

        {/* Decorative Blueprint Lines (Moved & Opacity Tuned) */}
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-[0.05] pointer-events-none">
          <svg className="text-[#002045]" fill="none" height="600" stroke="currentColor" viewBox="0 0 400 400" width="600">
            <circle cx="200" cy="200" r="150" strokeDasharray="4 8" strokeWidth="1.5" />
            <rect height="300" strokeWidth="1" width="300" x="50" y="50" />
            <line strokeWidth="1" x1="0" x2="400" y1="0" y2="400" />
            <line strokeWidth="1" x1="400" x2="0" y1="0" y2="400" />
          </svg>
        </div>
      </section>

      {/* ── Right: Login Form ── */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 lg:px-20 bg-[#FAF9F5] relative">
        <div className="w-full max-w-md space-y-12">
          {/* Form Header */}
          <div className="space-y-3">
            <span className="font-mono text-[11px] text-[#002045]/60 tracking-[0.25em] uppercase font-bold border-b border-[#002045]/10 pb-2 inline-block">
              身份验证管理单元
            </span>
            <h2 className="font-serif text-4xl font-black text-[#002045] tracking-tight">访问授权登录</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Field: Account */}
            <div className="space-y-2 group">
              <label
                htmlFor="username"
                className="font-mono text-xs text-[#002045]/60 uppercase group-focus-within:text-[#002045] font-bold transition-colors block px-3"
              >
                Academic ID / 账号
              </label>
              <div className="relative group/input">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-[#c4c6cf] focus:ring-0 focus:border-[#002045] px-3 py-4 text-lg transition-all duration-300 ease-in-out placeholder:text-[#74777f]/40 disabled:opacity-50 hover:bg-[#002045]/[0.02] focus:bg-[#002045]/5 autofill-ivory"
                  placeholder="输入您的研究员编号"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f]/40 group-focus-within/input:text-[#002045] transition-colors pointer-events-none">
                  person_search
                </span>
              </div>
            </div>

            {/* Input Field: Password */}
            <div className="space-y-2 group">
              <label
                htmlFor="password"
                className="font-mono text-xs text-[#002045]/60 uppercase group-focus-within:text-[#002045] font-bold transition-colors block px-3"
              >
                Cipher Key / 密码
              </label>
              <div className="relative group/input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-[#c4c6cf] focus:ring-0 focus:border-[#002045] px-3 py-4 font-mono text-lg tracking-[0.3em] transition-all duration-300 ease-in-out placeholder:text-[#74777f]/40 disabled:opacity-50 hover:bg-[#002045]/[0.02] focus:bg-[#002045]/5 autofill-ivory"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f]/40 hover:text-[#002045] focus:text-[#002045] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? 'visibility' : 'key'}
                </button>
              </div>
            </div>

            {/* Keep Active Checkbox Only */}
            <div className="flex items-center text-sm px-3">
              <label className="flex items-center gap-3 cursor-pointer group/check">
                <input
                  className="w-4 h-4 rounded-none border-2 border-[#002045] text-[#002045] focus:ring-offset-0 focus:ring-[#002045] transition-colors bg-transparent cursor-pointer"
                  type="checkbox"
                />
                <span className="font-mono text-xs text-[#43474e] group-hover/check:text-[#002045] transition-colors font-bold tracking-widest">
                  保持活跃会话
                </span>
              </label>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full group relative overflow-hidden bg-[#002045] text-white py-5 px-8 flex items-center justify-between transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgb(0,32,69,0.12)] hover:shadow-[0_8px_30px_rgb(0,32,69,0.2)]"
              >
                <span className="font-serif font-bold text-lg tracking-wide relative z-10">
                  {loading ? '身份校验中...' : '执行授权访问'}
                </span>
                <div className="flex items-center gap-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    fingerprint
                  </span>
                  <span className="material-symbols-outlined">
                    arrow_forward_ios
                  </span>
                </div>
                {/* Button Texture Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#002045] via-[#1A365D] to-[#002045] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />
              </button>
            </div>
          </form>
        </div>

        {/* Status Card & Legal */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="text-left space-y-4">
            <p className="font-mono text-[9px] text-[#74777f] leading-relaxed uppercase tracking-[0.2em]">
              本系统受国际数字版权保护法约束<br />
              未经授权的访问尝试将被永久记录并追溯
            </p>
            <div className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[#002045]/20 rounded-none transform rotate-45" />
              <div className="w-1.5 h-1.5 bg-[#002045]/20 rounded-none transform rotate-45" />
              <div className="w-1.5 h-1.5 bg-[#002045]/60 rounded-none transform rotate-45" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl border border-[#c4c6cf]/20 p-4 flex items-center gap-3 border-l-4 border-l-[#002045] shadow-sm">
            <span className="material-symbols-outlined text-[#002045] text-2xl">shield_lock</span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#002045] font-bold tracking-widest">NODE_STATUS</span>
              <span className="font-mono text-[10px] text-emerald-700 tracking-wider">ENCRYPTED_ONLINE</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
