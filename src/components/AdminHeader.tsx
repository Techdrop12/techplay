'use client';

import { LogOut, Menu, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AdminHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = session?.user?.name || 'Admin';
  const userEmail = session?.user?.email || '';

  return (
    <header className="bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))] shadow-[var(--shadow-sm)] px-4 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="text-xl font-bold text-[hsl(var(--text))]">TechPlay Admin</div>

      <div className="flex items-center gap-4">
        <button
          className="sm:hidden text-token-text/70 hover:text-[hsl(var(--text))]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
        >
          <Menu />
        </button>

        <div className="hidden sm:flex flex-col text-right text-sm">
          <span className="font-medium text-[hsl(var(--text))]">{userName}</span>
          <span className="text-token-text/60 text-xs">{userEmail}</span>
        </div>

        <button
          className="flex items-center gap-2 text-sm text-token-text/70 hover:text-red-600 transition"
          onClick={() => signOut()}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-14 right-4 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl shadow-[var(--shadow-md)] p-4 w-52 z-50 sm:hidden">
          <div className="text-sm font-medium text-[hsl(var(--text))] mb-2">
            <User size={14} className="inline mr-1" />
            {userName}
          </div>
          <button
            className="w-full text-left text-token-text/70 hover:text-red-600 text-sm"
            onClick={() => signOut()}
          >
            <LogOut size={14} className="inline mr-1" />
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}
