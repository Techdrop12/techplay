'use client';

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MoreHorizontal,
  X,
  BookOpen,
  Tag,
  Star,
  Mail,
  Send,
  ShieldCheck,
  Settings,
  Upload,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from '@/components/LocalizedLink';

const MAIN = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/commandes', label: 'Commandes', icon: <ShoppingCart size={20} /> },
  { href: '/admin/produits', label: 'Produits', icon: <Package size={20} /> },
  { href: '/admin/clients', label: 'Clients', icon: <Users size={20} /> },
];

const MORE = [
  { href: '/admin/blog', label: 'Blog', icon: <BookOpen size={16} /> },
  { href: '/admin/avis', label: 'Avis', icon: <Star size={16} /> },
  { href: '/admin/newsletter', label: 'Newsletter', icon: <Mail size={16} /> },
  { href: '/admin/newsletter-send', label: 'Envoyer email', icon: <Send size={16} /> },
  { href: '/admin/promos', label: 'Codes promo', icon: <Tag size={16} /> },
  { href: '/admin/contact', label: 'Contact', icon: <MessageSquare size={16} /> },
  { href: '/admin/import', label: 'Import', icon: <Upload size={16} /> },
  { href: '/admin/pages', label: 'Pages légales', icon: <FileText size={16} /> },
  { href: '/admin/audit', label: 'Journal', icon: <ShieldCheck size={16} /> },
  { href: '/admin/parametres', label: 'Paramètres', icon: <Settings size={16} /> },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 backdrop-blur-sm shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-1">
          {MAIN.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  active
                    ? 'text-[hsl(var(--accent))]'
                    : 'text-token-text/50 hover:text-[hsl(var(--text))]'
                }`}
              >
                <span className={active ? 'text-[hsl(var(--accent))]' : ''}>{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-token-text/50 hover:text-[hsl(var(--text))] transition-colors"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">Plus</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative bg-[hsl(var(--surface))] rounded-t-2xl border-t border-[hsl(var(--border))] p-4 pb-8 shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Navigation</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--surface-2))]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE.map(({ href, label, icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors ${
                      active
                        ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                        : 'bg-[hsl(var(--surface-2))] text-token-text/70 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))]'
                    }`}
                  >
                    {icon}
                    <span className="text-[10px] font-medium leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Spacer pour éviter que le contenu passe sous la bottom bar */}
      <div className="md:hidden h-16" />
    </>
  );
}
