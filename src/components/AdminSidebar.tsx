'use client';

import { LayoutDashboard, Package, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';

import Link from '@/components/LocalizedLink';

const links: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/import', label: 'Import produits', icon: <Package size={18} /> },
  { href: '/admin/generate-blog', label: 'Blog IA', icon: <Sparkles size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen px-4 py-6 shadow">
      <h2 className="text-lg font-bold text-[hsl(var(--text))] mb-6">🛠 Espace Admin</h2>
      <nav className="space-y-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname?.startsWith(href) ?? false;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                active
                  ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-semibold'
                  : 'text-token-text/80 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
