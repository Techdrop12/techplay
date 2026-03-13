import { redirect } from 'next/navigation'

import { isAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
  const ok = await isAdmin()

  if (!ok) {
    redirect('/login')
  }

  return (
    <main className="container py-16" role="main" aria-labelledby="admin-dashboard-title">
      <div className="rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:bg-[hsl(var(--surface))]/90 sm:p-8">
        <h1 id="admin-dashboard-title" className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <p className="text-[15px] text-gray-600 dark:text-gray-400">
          Vue d&apos;ensemble des ventes, avis, commandes.
        </p>
        {/* Intégration des widgets dans les prochains fichiers */}
      </div>
    </main>
  )
}
