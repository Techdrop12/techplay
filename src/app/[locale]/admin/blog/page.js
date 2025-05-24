'use client'

import { useState } from 'react'

export default function BlogAdminPage() {
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoPost, setAutoPost] = useState(null)

  const generate = async () => {
    if (!topic.trim()) return alert('Merci de saisir un sujet')
    setLoading(true)
    const res = await fetch('/api/blog/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
    const data = await res.json()
    setResult(data.content || '')
    setLoading(false)
  }

  const saveManual = async () => {
    const res = await fetch('/api/blog/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: topic, content: result }),
    })
    const data = await res.json()
    if (data.success) alert('Article enregistré ✅')
  }

  const autoPublish = async () => {
    setLoading(true)
    const res = await fetch('/api/blog/auto-publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
    const data = await res.json()
    setAutoPost(data)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧠 Génération & publication d’articles IA</h1>

      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Ex: Pourquoi un clavier mécanique RGB"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={generate} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
          Générer texte seulement
        </button>
        <button onClick={saveManual} disabled={!result} className="bg-green-600 text-white px-4 py-2 rounded">
          Sauvegarder ce texte manuellement
        </button>
        <button onClick={autoPublish} disabled={loading || !topic} className="bg-black text-white px-4 py-2 rounded">
          {loading ? 'Génération en cours...' : 'Auto-Générer & Publier'}
        </button>
      </div>

      {result && (
        <div className="mb-10 p-4 border rounded bg-white shadow whitespace-pre-line">
          <h2 className="font-semibold mb-2">📝 Aperçu du contenu généré (manuel)</h2>
          {result}
        </div>
      )}

      {autoPost?.success && (
        <div className="p-4 border bg-white rounded shadow">
          <h2 className="font-semibold text-lg mb-2">✅ Article publié automatiquement</h2>
          <p><strong>Titre :</strong> {autoPost.post.title}</p>
          <p><strong>Slug :</strong> /blog/{autoPost.post.slug}</p>
          {autoPost.post.image && (
            <>
              <p><strong>Image :</strong></p>
              <img src={autoPost.post.image} alt="" className="w-full h-64 object-cover rounded mt-2" />
            </>
          )}
        </div>
      )}

      {autoPost?.error && (
        <p className="mt-4 text-red-600">❌ Erreur : {autoPost.error}</p>
      )}
    </div>
  )
}
