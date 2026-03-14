import { redirect } from 'next/navigation'

import { isAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
  const ok = await isAdmin()

  if (!ok) {
    redirect('/login')
  }

  return (
    <main className="container py-16" role="main" aria-labelledby="admin-dashboard-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 id="admin-dashboard-title" className="heading-page mb-6">
          Dashboard Admin
        </h1>
        <p className="text-[15px] text-token-text/70">
          Vue d&apos;ensemble des ventes, avis, commandes.
        </p>
        {/* Intégration des widgets dans les prochains fichiers */}
      </div>
    </main>
  )
}
