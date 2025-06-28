'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = session?.user?.name || 'Admin';
  const userEmail = session?.user?.email || '';

  return (
    <header className="bg-white dark:bg-zinc-900 border-b shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="text-xl font-bold text-gray-800 dark:text-white">TechPlay Admin</div>

      <div className="flex items-center gap-4">
        {/* Menu Mobile Toggle */}
        <button
          className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
        >
          <Menu />
        </button>

        {/* Infos utilisateur desktop */}
        <div className="hidden sm:flex flex-col text-right text-sm">
          <span className="font-medium text-gray-700 dark:text-white">{userName}</span>
          <span className="text-gray-400 dark:text-gray-300 text-xs">{userEmail}</span>
        </div>

        {/* Déconnexion desktop */}
        <button
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
          onClick={() => signOut()}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Menu Mobile déroulant */}
      {menuOpen && (
        <div className="absolute top-14 right-4 bg-white dark:bg-zinc-800 border rounded shadow-md p-4 w-52 z-50 sm:hidden">
          <div className="text-sm font-medium text-gray-700 dark:text-white mb-2">
            <User size={14} className="inline mr-1" />
            {userName}
          </div>
          <button
            className="w-full text-left text-gray-600 dark:text-gray-300 hover:text-red-600 text-sm"
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
