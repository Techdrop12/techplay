'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { requestAndSaveToken } from '@/lib/firebase-client'

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const [stats, setStats] = useState(null)
  const [notifStatus, setNotifStatus] = useState(null)

  // Blog IA
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  const handleTestNotification = async () => {
    const token = await requestAndSaveToken()
    if (!token) {
      setNotifStatus('❌ Échec : Permission refusée ou token non généré')
      return
    }

    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🔔 Notification TechPlay',
        body: 'Ceci est une notification test depuis l’admin.',
        token,
      }),
    })

    setNotifStatus(res.ok
      ? '✅ Notification envoyée avec succès !'
      : '❌ Erreur lors de l’envoi de la notification')
  }

  const handleGenerate = async () => {
    setLoading(true)
    setSuccess(false)
    setPreview('')
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const { content } = await res.json()
      setPreview(content.html || content)
      setTitle(content.title || topic)
      setImage(content.image || '')
    } catch (err) {
      console.error('Erreur génération IA:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/blog/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: preview,
          image,
        }),
      })
      if (res.ok) setSuccess(true)
    } catch (err) {
      console.error('Erreur sauvegarde blog:', err)
    }
  }

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

      {/* Statistiques */}
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

      {/* Notification Test */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">🔔 Tester les notifications</h2>
        <button
          onClick={handleTestNotification}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Envoyer une notification de test
        </button>
        {notifStatus && (
          <p className="mt-3 text-sm text-gray-800 dark:text-gray-300">{notifStatus}</p>
        )}
      </div>

      {/* Blog IA */}
      <div className="mt-12 border-t pt-10">
        <h2 className="text-xl font-bold mb-4">🧠 Générer un article IA</h2>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Sujet de l'article (ex: Top gadgets 2025)"
          className="w-full border rounded px-4 py-2 mb-4"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {loading ? 'Génération...' : 'Générer'}
        </button>

        {preview && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Aperçu généré</h3>
            <textarea
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              rows={15}
              className="w-full border rounded px-4 py-2 mb-4 font-mono"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre personnalisé"
              className="w-full border rounded px-4 py-2 mb-4"
            />
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Lien de l’image (Unsplash)"
              className="w-full border rounded px-4 py-2 mb-4"
            />
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Sauvegarder l’article
            </button>
            {success && <p className="mt-2 text-green-600">✅ Article enregistré</p>}
          </div>
        )}
      </div>
    </div>
  )
}
