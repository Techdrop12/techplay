'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { event } from '@/lib/ga'

interface ReviewFormProps {
  productId: string
}

const MIN_LEN = 20
const MAX_LEN = 600
const COOLDOWN_SEC = 60

export default function ReviewForm({ productId }: ReviewFormProps) {
  const t = useTranslations('reviews')
  const tr = (key: string, fallback: string) => {
    try {
      const v = t(key)
      return typeof v === 'string' ? v : fallback
    } catch {
      return fallback
    }
  }

  // Champs
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [hover, setHover] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hp, setHp] = useState('') // honeypot

  // Cooldown
  const cooldownKey = useMemo(() => `tp_review_cd:${productId}`, [productId])
  const lastBodyKey = useMemo(() => `tp_review_body:${productId}`, [productId])
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const endAt = Number(localStorage.getItem(cooldownKey) || 0)
    const update = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setCooldownLeft(left)
    }
    update()
    if (endAt > Date.now()) {
      timerRef.current = setInterval(update, 300)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [cooldownKey])

  const startCooldown = () => {
    const endAt = Date.now() + COOLDOWN_SEC * 1000
    localStorage.setItem(cooldownKey, String(endAt))
    setCooldownLeft(COOLDOWN_SEC)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setCooldownLeft(left)
      if (left <= 0 && timerRef.current) clearInterval(timerRef.current)
    }, 300)
  }

  // Accessibilité clavier sur les étoiles
  const handleStarsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setRating((r) => Math.min(5, r + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setRating((r) => Math.max(1, r - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setRating(1)
    } else if (e.key === 'End') {
      e.preventDefault()
      setRating(5)
    }
  }

  const remaining = Math.max(0, MAX_LEN - comment.length)
  const tooShort = comment.trim().length > 0 && comment.trim().length < MIN_LEN
  const disabled = sending || cooldownLeft > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return

    // Honeypot -> bot probable
    if (hp) {
      toast.success('Merci !') // silencieux pour les bots
      return
    }

    const bodyTrim = comment.trim()
    if (!bodyTrim) {
      toast.error(tr('empty_error', 'Votre message est vide.'))
      return
    }
    if (bodyTrim.length < MIN_LEN) {
      toast.error(
        tr('minlen_error', `Votre message doit contenir au moins ${MIN_LEN} caractères.`),
      )
      return
    }
    if (rating < 1 || rating > 5) {
      toast.error(tr('rating_error', 'Veuillez sélectionner une note valide.'))
      return
    }

    // anti-duplication simple (même contenu posté il y a peu)
    const lastBody = localStorage.getItem(lastBodyKey)
    if (lastBody && lastBody === bodyTrim) {
      toast.error(tr('duplicate_error', 'Vous avez déjà envoyé cet avis récemment.'))
      return
    }

    setSending(true)
    try {
      const res = await fetch(`/api/reviews/product/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: bodyTrim,
          name: name.trim() || 'Client TechPlay',
        }),
      })

      if (!res.ok) throw new Error('HTTP ' + res.status)

      // GA4
      event({
        action: 'submit_review',
        category: 'engagement',
        label: 'Avis client',
        value: rating,
      })

      // Optimiste
      setSubmitted(true)
      setComment('')
      setName('')
      setRating(5)

      localStorage.setItem(lastBodyKey, bodyTrim)
      startCooldown()
      toast.success(tr('thank_you', 'Merci pour votre avis !'))
    } catch {
      toast.error(tr('submit_error', 'Une erreur est survenue, merci de réessayer.'))
    } finally {
      setSending(false)
    }
  }

  // JSON-LD après succès (améliore le SEO si l’API stocke l’avis)
  const jsonLd =
    submitted
      ? {
          '@context': 'https://schema.org',
          '@type': 'Review',
          itemReviewed: {
            '@type': 'Product',
            sku: productId,
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: rating,
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody: comment || 'Avis envoyé',
          author: { '@type': 'Person', name: name.trim() || 'Client TechPlay' },
        }
      : null

  if (submitted) {
    return (
      <>
        <motion.p
          className="mt-6 text-green-600 dark:text-green-400 font-semibold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="status"
          aria-live="polite"
        >
          {tr('thank_you', 'Merci pour votre avis !')}
        </motion.p>

        {jsonLd && (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6 space-y-5"
      aria-label={tr('form_label', 'Formulaire d’avis')}
      noValidate
    >
      <h3 className="text-2xl font-extrabold text-center">
        {tr('write_review', 'Laisser un avis')}
      </h3>

      {/* Nom (optionnel) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{tr('name_label', 'Nom (optionnel)')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {/* Honeypot (doit rester caché) */}
        <label className="sr-only" aria-hidden>
          <span>Website</span>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
          />
        </label>
      </div>

      {/* ⭐ Note */}
      <div
        className="flex gap-1 justify-center"
        role="radiogroup"
        aria-label={tr('rating_label', 'Note globale')}
        onKeyDown={handleStarsKeyDown}
        tabIndex={0}
      >
        {[1, 2, 3, 4, 5].map((val) => {
          const active = (hover ?? rating) >= val
          return (
            <motion.button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              onMouseEnter={() => setHover(val)}
              onMouseLeave={() => setHover(null)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              aria-checked={rating === val}
              aria-label={`${val} ${tr('stars', 'étoiles')}`}
              role="radio"
              className={`transition text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${
                active ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              <Star fill={active ? 'currentColor' : 'none'} size={26} />
            </motion.button>
          )
        })}
      </div>

      {/* 💬 Commentaire */}
      <div>
        <label htmlFor="review-text" className="sr-only">
          {tr('textarea_label', 'Votre avis')}
        </label>
        <textarea
          id="review-text"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_LEN))}
          placeholder={tr('placeholder', 'Partagez votre expérience…')}
          className="w-full border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-zinc-900 dark:text-white"
          rows={5}
          required
          aria-describedby="review-help review-counter"
        />
        <div id="review-help" className="mt-1 text-xs text-gray-500">
          {tr(
            'helper_text',
            `Soyez précis et respectueux. Au moins ${MIN_LEN} caractères.`,
          )}
        </div>
        <div
          id="review-counter"
          className={`mt-1 text-xs ${tooShort ? 'text-orange-600' : 'text-gray-400'}`}
          aria-live="polite"
        >
          {remaining} / {MAX_LEN}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        type="submit"
        disabled={disabled}
        aria-busy={sending}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={`w-full rounded-xl bg-accent text-white px-4 py-3 text-base font-extrabold shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/50 ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/90'
        }`}
      >
        {sending
          ? tr('sending', 'Envoi en cours…')
          : cooldownLeft > 0
          ? tr('cooldown', `Patientez ${cooldownLeft}s…`)
          : tr('submit', 'Envoyer l’avis')}
      </motion.button>
    </form>
  )
}
