'use client'
import { useState } from 'react'
import RatingStars from '@/components/ui/RatingStars'

export default function ProductReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: envoyer l'avis via API
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="font-semibold mb-2">Laisser un avis</h3>
      <RatingStars value={rating} onChange={setRating} editable />
      <textarea
        className="w-full border rounded mt-2 p-2"
        placeholder="Votre avis"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" className="mt-2 px-4 py-2 bg-brand text-white rounded">
        Envoyer
      </button>
    </form>
  )
}
