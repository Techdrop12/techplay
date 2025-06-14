'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
// import { logEvent } from '@/lib/logEvent'

export default function ReviewForm({ productId }) {
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(null)
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
        setReview('')
        setRating(5)
        toast.success('Merci pour votre avis !')
        // logEvent('review_submitted', { rating })
      } else {
        throw new Error()
      }
    } catch {
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
        aria-live="polite"
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
        className="flex gap-1 justify-center"
        role="radiogroup"
        aria-label="Note"
      >
        {[1, 2, 3, 4, 5].map((val) => (
          <motion.button
            key={val}
            type="button"
            onClick={() => setRating(val)}
            onMouseEnter={() => setHover(val)}
            onMouseLeave={() => setHover(null)}
            className={`transition text-2xl ${
              (hover || rating) >= val ? 'text-yellow-400' : 'text-gray-300'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`${val} étoile${val > 1 ? 's' : ''}`}
          >
            <Star
              fill={(hover || rating) >= val ? 'currentColor' : 'none'}
              size={24}
            />
          </motion.button>
        ))}
      </motion.div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Votre avis..."
        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
        rows={4}
        required
        aria-label="Votre commentaire"
      />

      <motion.button
        type="submit"
        disabled={isSending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-black text-white px-4 py-2 rounded w-full transition ${
          isSending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSending ? 'Envoi en cours...' : 'Envoyer'}
      </motion.button>
    </form>
  )
}
