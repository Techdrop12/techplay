'use client';

import { ChevronRight, LogOut, Menu, PanelLeft, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAdminLayout } from '@/components/AdminShell';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.15)] text-[13px] font-bold text-[hsl(var(--accent))] ring-1 ring-[hsl(var(--accent)/0.25)]">
      {initials || '?'}
    </span>
  );
}

export default function AdminHeader() {
  const t = useTranslations('admin');
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { sidebarCollapsed, toggleSidebar } = useAdminLayout();

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const userName = session?.user?.name || 'Admin';
  const userEmail = session?.user?.email || '';

  const segments = pathname
    ?.split('/')
    .filter(Boolean)
    .slice(1);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 backdrop-blur-sm px-4 py-2.5 shadow-[var(--shadow-sm)]">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text/60 transition hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={sidebarCollapsed ? t('sidebar_expand_aria') : t('sidebar_collapse_aria')}
        >
          <PanelLeft size={15} />
        </button>
        <button
          className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-token-text/60 hover:text-[hsl(var(--text))]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t('header_open_menu')}
          type="button"
        >
          <Menu size={17} />
        </button>

        {/* Breadcrumb */}
        {segments && segments.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 text-xs text-token-text/50 truncate">
            <span className="font-medium text-token-text/40">Admin</span>
            {segments.map((seg, idx) => (
              <span key={seg} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span
                  className={
                    idx === segments.length - 1
                      ? 'font-semibold text-[hsl(var(--text))] capitalize'
                      : 'text-token-text/60 capitalize'
                  }
                >
                  {seg.replace(/[-_]/g, ' ')}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: search hint + user + logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command palette hint */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
            );
          }}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] px-3 py-1.5 text-[12px] text-token-text/50 transition hover:border-[hsl(var(--accent)/0.4)] hover:text-token-text/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('command_palette_hint')}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{t('command_palette_hint')}</span>
          <kbd className="ml-1 inline-flex items-center gap-0.5 rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* User identity */}
        <div className="hidden sm:flex items-center gap-2">
          <UserAvatar name={userName} />
          <div className="hidden lg:flex flex-col text-right leading-tight">
            <span className="text-[13px] font-semibold text-[hsl(var(--text))]">{userName}</span>
            <span className="text-[11px] text-token-text/50 truncate max-w-[140px]">{userEmail}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-[12px] font-medium text-token-text/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          onClick={() => signOut()}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{t('header_signout')}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div ref={menuRef} className="absolute top-[calc(100%+4px)] right-4 w-52 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-md)] p-3 z-50 sm:hidden">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[hsl(var(--border))]">
            <UserAvatar name={userName} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[hsl(var(--text))] truncate">{userName}</p>
              <p className="text-[11px] text-token-text/50 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-token-text/70 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={() => signOut()}
            type="button"
          >
            <LogOut size={14} />
            {t('header_signout')}
          </button>
        </div>
      )}
    </header>
  );
}
