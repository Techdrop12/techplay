'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { event } from '@/lib/ga'

interface Props {
  productId: string
}

export default function ReviewForm({ productId }: Props) {
  const t = useTranslations('reviews')

  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || rating < 1 || rating > 5 || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/reviews/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          name: 'Client TechPlay', // à remplacer si user connecté
        }),
      })

      if (!res.ok) throw new Error()

      // Tracking GA4
      event({
        action: 'submit_review',
        category: 'engagement',
        label: 'Avis client',
        value: rating,
      })

      setSubmitted(true)
      setComment('')
      setRating(5)
      toast.success(t('thank_you'))
    } catch {
      toast.error(t('submit_error'))
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <motion.p
        className="mt-6 text-green-600 font-semibold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="status"
        aria-live="polite"
      >
        {t('thank_you')}
      </motion.p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 border-t pt-6 space-y-4"
      aria-label={t('form_label')}
      noValidate
    >
      <h3 className="text-xl font-semibold">{t('write_review')}</h3>

      {/* Étoiles */} 
      <div
        className="flex gap-1 justify-center"
        role="radiogroup"
        aria-label={t('rating_label')}
      >
        {[1, 2, 3, 4, 5].map((val) => (
          <motion.button
            key={val}
            type="button"
            onClick={() => setRating(val)}
            onMouseEnter={() => setHover(val)}
            onMouseLeave={() => setHover(null)}
            className={`transition text-2xl ${
              (hover ?? rating) >= val ? 'text-yellow-400' : 'text-gray-300'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-checked={rating === val}
            aria-label={`${val} ${t('stars')}`}
            role="radio"
          >
            <Star
              fill={(hover ?? rating) >= val ? 'currentColor' : 'none'}
              size={24}
            />
          </motion.button>
        ))}
      </div>

      {/* Commentaire */} 
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-900 dark:text-white"
        rows={4}
        required
        aria-label={t('textarea_label')}
      />

      {/* Bouton envoyer */} 
      <motion.button
        type="submit"
        disabled={sending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`bg-black text-white px-4 py-2 rounded w-full transition font-medium ${
          sending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-busy={sending}
      >
        {sending ? t('sending') : t('submit')}
      </motion.button>
    </form>
  )
}
