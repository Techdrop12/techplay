// src/components/AdminHeader.js

'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="text-xl font-bold text-gray-800">TechPlay Admin</div>

      <div className="flex items-center gap-4">
        <button
          className="sm:hidden text-gray-600 hover:text-black"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu />
        </button>

        <div className="hidden sm:flex flex-col text-right text-sm">
          <span className="font-medium text-gray-700">
            {session?.user?.name || 'Admin'}
          </span>
          <span className="text-gray-400">{session?.user?.email}</span>
        </div>

        <button
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
          onClick={() => signOut()}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-14 right-4 bg-white border rounded shadow-md p-4 w-52 z-50 sm:hidden">
          <div className="text-sm font-medium text-gray-700 mb-2">
            <User size={14} className="inline mr-1" />
            {session?.user?.name || 'Admin'}
          </div>
          <button
            className="w-full text-left text-gray-600 hover:text-red-600 text-sm"
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
