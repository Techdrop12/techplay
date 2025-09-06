'use client';

import Link from '@/components/LocalizedLink'
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ScrollText,
  Sparkles,
  MessageSquareText,
  ShieldCheck,
  PlusSquare,
  BarChart,
} from 'lucide-react';

const links = [
  { href: '/fr/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/fr/admin/produit', label: 'Produits', icon: <Package size={18} /> },
  { href: '/fr/admin/produit/ajouter', label: 'Ajouter', icon: <PlusSquare size={18} /> },
  { href: '/fr/admin/commandes', label: 'Commandes', icon: <ScrollText size={18} /> },
  { href: '/fr/admin/avis', label: 'Avis clients', icon: <MessageSquareText size={18} /> },
  { href: '/fr/admin/blog', label: 'Blog IA', icon: <Sparkles size={18} /> },
  { href: '/fr/admin/analytics', label: 'Statistiques', icon: <BarChart size={18} /> },
  { href: '/fr/admin/settings', label: 'Paramètres', icon: <ShieldCheck size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen px-4 py-6 shadow">
      <h2 className="text-lg font-bold text-gray-700 mb-6">🛠 Espace Admin</h2>
      <nav className="space-y-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                active
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
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
