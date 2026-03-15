'use client'

import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  PlusCircle,
  ShoppingCart,
  Sparkles,
  Upload,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import type { ReactNode } from 'react'

import Link from '@/components/LocalizedLink'

const linkKeys: { href: string; labelKey: string; icon: ReactNode }[] = [
  { href: '/admin/dashboard', labelKey: 'nav_dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/produits', labelKey: 'nav_products', icon: <Package size={18} /> },
  { href: '/admin/produits/nouveau', labelKey: 'nav_add_product', icon: <PlusCircle size={18} /> },
  { href: '/admin/blog', labelKey: 'nav_blog', icon: <FileText size={18} /> },
  { href: '/admin/blog/nouveau', labelKey: 'nav_new_article', icon: <PlusCircle size={18} /> },
  { href: '/admin/avis', labelKey: 'nav_reviews', icon: <MessageSquare size={18} /> },
  { href: '/admin/contact', labelKey: 'nav_contact', icon: <FileText size={18} /> },
  { href: '/admin/newsletter', labelKey: 'nav_newsletter', icon: <MessageSquare size={18} /> },
  { href: '/admin/pages', labelKey: 'nav_legal', icon: <FileText size={18} /> },
  { href: '/admin/commandes', labelKey: 'nav_orders', icon: <ShoppingCart size={18} /> },
  { href: '/admin/import', labelKey: 'nav_import', icon: <Upload size={18} /> },
  { href: '/admin/generate-blog', labelKey: 'nav_generate_blog', icon: <Sparkles size={18} /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('admin')

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] min-h-screen px-4 py-6 shadow-[var(--shadow-sm)]">
      <h2 className="text-lg font-bold text-[hsl(var(--text))] mb-6 px-2">🛠 {t('admin_space')}</h2>
      <nav className="space-y-1" aria-label={t('admin_nav_aria')}>
        {linkKeys.map(({ href, labelKey, icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] ${
                active
                  ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-semibold'
                  : 'text-token-text/80 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {icon}
              {t(labelKey)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
