'use client'

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
        const { message } = await res.json()
        toast.error(message || 'Erreur lors de la génération')
        setLoading(false)
        return
      }

      const data = await res.json()
      setResult(data.post.content)
      toast.success('Article généré avec succès !')
    } catch (error) {
      toast.error('Erreur réseau')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Générer un article de blog</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Sujet du blog"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border p-2 w-full"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? 'Génération en cours...' : 'Générer'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-line">
          <h3 className="font-semibold mb-2">Contenu généré :</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  )
}
