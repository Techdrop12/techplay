'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import AdminCommandPalette from '@/components/AdminCommandPalette';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastSystem } from '@/components/ToastSystem';

type AdminLayoutContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | undefined>(undefined);

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) {
    throw new Error('useAdminLayout must be used within AdminShell');
  }
  return ctx;
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((v) => !v),
      }}
    >
      <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6" role="main">
            {children}
          </main>
          <ToastSystem />
        </div>
        <AdminCommandPalette />
      </div>
    </AdminLayoutContext.Provider>
  );
}

