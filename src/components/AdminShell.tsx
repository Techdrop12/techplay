'use client'

import type { ReactNode } from 'react'

import AdminHeader from '@/components/AdminHeader'
import AdminSidebar from '@/components/AdminSidebar'
import { ToastSystem } from '@/components/ToastSystem'

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6" role="main">
          {children}
        </main>
        <ToastSystem />
      </div>
    </div>
  )
}
