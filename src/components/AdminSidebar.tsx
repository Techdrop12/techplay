'use client';

import {
  BookOpen,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  PlusCircle,
  ShoppingCart,
  Star,
  Upload,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import Link from '@/components/LocalizedLink';
import { useAdminLayout } from '@/components/AdminShell';

type NavItem = { href: string; labelKey: string; icon: ReactNode };
type NavGroup = { groupKey: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'group_main',
    items: [
      { href: '/admin/dashboard', labelKey: 'nav_dashboard', icon: <LayoutDashboard size={17} /> },
      { href: '/admin/commandes', labelKey: 'nav_orders', icon: <ShoppingCart size={17} /> },
    ],
  },
  {
    groupKey: 'group_catalogue',
    items: [
      { href: '/admin/produits', labelKey: 'nav_products', icon: <Package size={17} /> },
      { href: '/admin/produits/nouveau', labelKey: 'nav_add_product', icon: <PlusCircle size={17} /> },
      { href: '/admin/import', labelKey: 'nav_import', icon: <Upload size={17} /> },
    ],
  },
  {
    groupKey: 'group_content',
    items: [
      { href: '/admin/blog', labelKey: 'nav_blog', icon: <BookOpen size={17} /> },
      { href: '/admin/blog/nouveau', labelKey: 'nav_new_article', icon: <PlusCircle size={17} /> },
      { href: '/admin/pages', labelKey: 'nav_legal', icon: <FileText size={17} /> },
    ],
  },
  {
    groupKey: 'group_community',
    items: [
      { href: '/admin/avis', labelKey: 'nav_reviews', icon: <Star size={17} /> },
      { href: '/admin/contact', labelKey: 'nav_contact', icon: <MessageSquare size={17} /> },
      { href: '/admin/newsletter', labelKey: 'nav_newsletter', icon: <Mail size={17} /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const { sidebarCollapsed } = useAdminLayout();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] min-h-screen shadow-[var(--shadow-sm)] transition-[width,padding] duration-200 ease-[var(--ease-smooth)] ${
        sidebarCollapsed ? 'w-[60px] px-2' : 'w-60 px-3'
      }`}
      aria-label={t('admin_nav_aria')}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-2.5 py-4 mb-2 ${sidebarCollapsed ? 'justify-center' : 'px-1'}`}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)]">
          <LayoutDashboard size={15} />
        </span>
        {!sidebarCollapsed && (
          <span className="text-[13px] font-bold tracking-tight text-[hsl(var(--text))]">
            TechPlay <span className="text-[hsl(var(--accent))]">Admin</span>
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto py-1">
        {NAV_GROUPS.map(({ groupKey, items }) => (
          <div key={groupKey}>
            {!sidebarCollapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-token-text/40 select-none">
                {t(groupKey)}
              </p>
            )}
            <ul className="space-y-0.5" role="list">
              {items.map(({ href, labelKey, icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      title={sidebarCollapsed ? t(labelKey) : undefined}
                      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--surface))] ${
                        active
                          ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-semibold'
                          : 'text-token-text/70 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))]'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <span
                        className={`shrink-0 transition-colors ${
                          active ? 'text-[hsl(var(--accent))]' : 'text-token-text/50 group-hover:text-[hsl(var(--text))]'
                        }`}
                      >
                        {icon}
                      </span>
                      {!sidebarCollapsed && <span className="truncate">{t(labelKey)}</span>}
                      {!sidebarCollapsed && active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — View site */}
      <div className={`border-t border-[hsl(var(--border))] py-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={t('nav_view_site')}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-token-text/50 transition hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <ExternalLink size={15} className="shrink-0" />
          {!sidebarCollapsed && <span>{t('nav_view_site')}</span>}
        </a>
      </div>
    </aside>
  );
}
