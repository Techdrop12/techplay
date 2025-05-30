'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ReviewForm({ slug }) {
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!review || rating < 1 || rating > 5) {
      toast.error("Merci d'ajouter un commentaire et une note valide")
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, review, rating }),
      })

      if (res.ok) {
        toast.success('Merci pour votre avis !')
        setSubmitted(true)
      } else {
        throw new Error()
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'avis")
    }
  }

  if (submitted) {
    return <p className="mt-4 text-green-600 font-semibold">Merci pour votre avis 💬</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-2">Laissez un avis</h3>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Votre avis..."
        className="w-full border p-2 rounded mb-2"
        rows={4}
        required
      />
      <div className="mb-2">
        <label className="mr-2">Note :</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-1 rounded"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Envoyer
      </button>
    </form>
  )
}
