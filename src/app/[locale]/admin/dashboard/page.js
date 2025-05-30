'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        <p className="text-sm">Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded shadow p-4"
        >
          <p className="text-sm text-gray-500">{t('total_sales')}</p>
          <p className="text-xl font-bold">{stats.caMonth.toFixed(2)} €</p>
          <p className="text-xs text-green-600 mt-1">💶 Mois en cours</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded shadow p-4"
        >
          <p className="text-sm text-gray-500">{t('estimated_next_week')}</p>
          <p className="text-xl font-bold">{stats.caNextWeek.toFixed(2)} €</p>
          <p className="text-xs text-blue-600 mt-1">📈 Prévisionnel</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-800 rounded shadow p-4"
        >
          <p className="text-sm text-gray-500">{t('orders_next_week')}</p>
          <p className="text-xl font-bold">{stats.ordersNextWeek}</p>
          <p className="text-xs text-purple-600 mt-1">📦 Commandes prévues</p>
        </motion.div>
      </div>
    </div>
  )
}
