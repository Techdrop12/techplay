'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const ratings = [
  { value: 5, emoji: '😍', label: 'Excellent' },
  { value: 4, emoji: '😊', label: 'Bien' },
  { value: 3, emoji: '😐', label: 'Moyen' },
  { value: 2, emoji: '😕', label: 'Insatisfait' },
  { value: 1, emoji: '😡', label: 'Nul' },
]

export default function ReviewForm({ productId }) {
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!review || rating < 1 || rating > 5 || isSending) return

    setIsSending(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          comment: review,
          rating,
          name: 'Client TechPlay',
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success('Merci pour votre avis !')
      } else {
        throw new Error()
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'avis")
    } finally {
      setIsSending(false)
    }
  }

  if (submitted) {
    return (
      <motion.p
        className="mt-6 text-green-600 font-semibold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Merci pour votre avis 💬
      </motion.p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 border-t pt-6 space-y-4">
      <h3 className="text-xl font-semibold">Laissez un avis</h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 justify-center"
      >
        {ratings.map((r) => (
          <motion.button
            key={r.value}
            type="button"
            onClick={() => setRating(r.value)}
            className={`text-2xl px-3 py-2 rounded-full ${
              rating === r.value ? 'bg-yellow-300 scale-110' : 'bg-gray-100'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={r.label}
          >
            {r.emoji}
          </motion.button>
        ))}
      </motion.div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Votre avis..."
        className="w-full border p-2 rounded"
        rows={4}
        required
      />

      <motion.button
        type="submit"
        disabled={isSending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-black text-white px-4 py-2 rounded ${
          isSending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSending ? 'Envoi en cours...' : 'Envoyer'}
      </motion.button>
    </form>
  )
}
