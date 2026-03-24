'use client';

import { useEffect, useState } from 'react';
import { Mail, Calendar, Shield, ExternalLink, ChevronRight } from 'lucide-react';
import { getUser, type UserInfo } from '@/services/auth.service';

export default function UserPanel() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    getUser().then(setUser).catch(() => null);
  }, []);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {/* Avatar + Name card */}
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-base font-bold text-stone-800 dark:text-stone-200 overflow-hidden shadow-[3px_3px_0px_rgba(28,25,23,1)] dark:shadow-[3px_3px_0px_rgba(168,162,158,1)] border-2 font-serif node-paper-bg ${
                user?.tier === 'Ultra' ? 'border-amber-600 bg-amber-50' :
                user?.tier === 'Pro' ? 'border-stone-800 bg-stone-200' :
                user?.tier === 'Plus' ? 'border-emerald-700 bg-emerald-50' :
                'border-stone-800 bg-stone-50'
              }`}>
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              
              {/* Tier Badge */}
              <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-sm px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(28,25,23,1)] dark:shadow-[1px_1px_0px_rgba(168,162,158,1)] z-10 whitespace-nowrap border-[1.5px] border-stone-800 dark:border-stone-400 font-mono
                ${user?.tier === 'Ultra' ? 'bg-amber-100 text-amber-900 border-amber-700' :
                  user?.tier === 'Pro' ? 'bg-stone-200 text-stone-900 border-stone-800' :
                  user?.tier === 'Plus' ? 'bg-emerald-100 text-emerald-900 border-emerald-700' :
                  'bg-stone-100 text-stone-700 border-stone-700'
                }
              `}>
                {user?.tier || 'Free'}
              </div>
            </div>
            <div className="min-w-0 flex-1 pl-2">
              <p className="truncate text-sm font-bold font-serif text-foreground">
                {user?.name || '用户'}
              </p>
              <p className="truncate text-[11px] font-mono text-muted-foreground mt-0.5 opacity-80">
                {user?.email || '加载中...'}
              </p>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="space-y-1 px-2 py-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-[11px]">{user?.email || '–'}</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px]">角色：{user?.role || '用户'}</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-muted-foreground">
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px]">账户状态：正常</span>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="border-t border-border px-2 py-3">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            快捷操作
          </p>
          <div className="space-y-0.5">
            <a
              href="https://docs.1037solo.com/#/docs/studysolo-intro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              查看使用手册
              <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/30" />
            </a>
            <a
              href="https://github.com/AIMFllys/StudySolo/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              反馈问题
              <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/30" />
            </a>
          </div>
        </div>

        {/* Version info */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-foreground">StudySolo</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">v0.2.001 · MVP</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="text-[10px] font-medium text-primary">在线</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
