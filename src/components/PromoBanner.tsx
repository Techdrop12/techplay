'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Promo {
  text: string
  url?: string
  bg?: string
  condition?: () => boolean
}

interface PromoBannerProps {
  message?: string
  link?: string
  bgColor?: string
  auto?: boolean
}

const defaultPromos: Promo[] = [
  {
    text: '🎁 Livraison gratuite ce soir jusqu’à minuit !',
    url: '/fr/produit',
    bg: 'bg-green-600',
    condition: () => {
      const hour = new Date().getHours()
      return hour >= 18 && hour <= 23
    },
  },
  {
    text: '🚚 Livraison rapide sur tous les produits TechPlay !',
    url: '/fr/categorie',
    bg: 'bg-blue-700',
  },
  {
    text: '⭐ Offres limitées sur nos best-sellers high-tech !',
    url: '/fr/categorie/best-sellers',
    bg: 'bg-orange-500',
  },
]

export default function PromoBanner({ message, link, bgColor = 'bg-yellow-500', auto = true }: PromoBannerProps) {
  const [visible, setVisible] = useState(true)
  const [current, setCurrent] = useState<Promo | null>(null)

  useEffect(() => {
    if (auto) {
      const eligible = defaultPromos.filter((p) => !p.condition || p.condition())
      if (eligible.length > 0) {
        const random = Math.floor(Math.random() * eligible.length)
        setCurrent(eligible[random])
      }
    } else if (message) {
      setCurrent({ text: message, url: link, bg: bgColor })
    }

    const timeout = setTimeout(() => setVisible(false), 12000)
    return () => clearTimeout(timeout)
  }, [auto, message, link, bgColor])

  if (!visible || !current) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'text-white text-sm text-center py-2 px-4 font-semibold shadow-md relative z-40',
          current.bg || bgColor
        )}
        role="status"
        aria-live="polite"
      >
        {current.url ? (
          <Link href={current.url} className="hover:underline block">
            {current.text}
          </Link>
        ) : (
          <span>{current.text}</span>
        )}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1 text-white text-lg font-bold"
          aria-label="Fermer la bannière promotionnelle"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
