'use client'

import { useState, useEffect } from 'react'

export default function ReviewForm({ slug }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch(`/api/products/${slug}/review`)
      .then(res => res.json())
      .then(setReviews)
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !comment.trim()) {
      alert("Veuillez remplir tous les champs.")
      return
    }

    const res = await fetch(`/api/products/${slug}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim() }),
    })

    if (!res.ok) {
      alert("Erreur lors de l'envoi de l'avis.")
      return
    }

    setName('')
    setRating(5)
    setComment('')

    const updated = await fetch(`/api/products/${slug}/review`)
    setReviews(await updated.json())
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2">Laissez un avis</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Votre nom"
          className="border px-2 py-1 w-full rounded"
          required
        />
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="border px-2 py-1 w-full rounded"
        >
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} étoile{r > 1 ? 's' : ''}</option>
          ))}
        </select>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Votre avis..."
          className="border px-2 py-1 w-full rounded"
          rows={3}
          required
        ></textarea>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
      </form>

      {reviews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Avis des clients</h3>
          <ul className="space-y-2 text-sm">
            {reviews.map((r, i) => (
              <li key={i} className="border rounded p-3">
                <p><strong>{r.name}</strong> ({r.rating} ⭐)</p>
                <p className="text-gray-700">{r.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
