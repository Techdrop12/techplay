import { redirect } from 'next/navigation'

import { isAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
  const ok = await isAdmin()

  if (!ok) {
    redirect('/login')
  }

  return (
    <main className="container py-16">
      <h1 className="mb-6 text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-muted-foreground">Vue d’ensemble des ventes, avis, commandes.</p>
      {/* Intégration des widgets dans les prochains fichiers */}
    </main>
  )
}
