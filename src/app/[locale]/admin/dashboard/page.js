'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
  }, [])

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">{t('dashboard')}</h1>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">{t('total_sales')}</p>
          <p className="text-xl font-bold">{stats.caMonth.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">{t('estimated_next_week')}</p>
          <p className="text-xl font-bold">{stats.caNextWeek.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">{t('orders_next_week')}</p>
          <p className="text-xl font-bold">{stats.ordersNextWeek}</p>
        </div>
      </div>
    </div>
  )
}
