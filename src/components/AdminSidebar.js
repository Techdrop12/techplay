// src/components/AdminSidebar.js

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ScrollText, Sparkles, User } from 'lucide-react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/products', label: 'Produits', icon: <Package size={18} /> },
  { href: '/admin/orders', label: 'Commandes', icon: <ScrollText size={18} /> },
  { href: '/admin/blog', label: 'Blog IA', icon: <Sparkles size={18} /> },
  { href: '/admin/users', label: 'Utilisateurs', icon: <User size={18} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r min-h-screen px-4 py-6">
      <nav className="space-y-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
                active
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
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
