'use client'

import { useEffect, useState } from 'react'

export default function AdminAnalyticsBlock() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) return <p>Chargement stats...</p>

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded mb-6 text-sm">
      <p><strong>👥 Visiteurs uniques (30j) :</strong> {data.users}</p>
      <p><strong>📈 Pages vues :</strong> {data.pageViews}</p>
      <p><strong>🛒 Conversion :</strong> {data.conversionRate}%</p>
      <p><strong>💰 CA total :</strong> {data.totalRevenue} €</p>
    </div>
  )
}
