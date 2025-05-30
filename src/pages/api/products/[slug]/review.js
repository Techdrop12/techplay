'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function ReviewForm({ slug }) {
  const [reviews, setReviews] = useState([])
  const [author, setAuthor] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${slug}/review`)
      .then((res) => res.json())
      .then(setReviews)
      .catch(() => toast.error("Erreur chargement avis"))
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!author || !comment) return toast.error('Nom et commentaire requis')

    setLoading(true)
    try {
      const res = await fetch(`/api/products/${slug}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, comment }),
      })
      if (!res.ok) throw new Error()
      const newReview = await res.json()
      setReviews([newReview, ...reviews])
      setAuthor('')
      setComment('')
      toast.success('Avis ajouté')
    } catch {
      toast.error("Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Avis clients</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Votre nom"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Votre commentaire"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>

      <ul>
        {reviews.map((r, i) => (
          <li key={i} className="mb-4 border-b pb-2">
            <p className="font-semibold">{r.author}</p>
            <p className="text-sm text-gray-600">{r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
