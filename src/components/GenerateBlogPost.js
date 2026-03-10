'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function GenerateBlogPost() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!topic.trim()) {
      toast.error('Merci de saisir un sujet')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.message || 'Erreur lors de la génération')
        return
      }

      const data = await res.json()
      setResult(data?.post?.content ?? '')
      toast.success('Article généré avec succès !')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="mx-auto max-w-xl p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-xl font-bold">Générer un article de blog</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Sujet du blog"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Génération en cours...' : 'Générer'}
        </button>
      </form>

      {result && (
        <motion.div
          className="mt-6 whitespace-pre-line rounded border border-gray-300 bg-gray-100 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-2 font-semibold">Contenu généré :</h3>
          <p>{result}</p>
        </motion.div>
      )}
    </motion.div>
  )
}