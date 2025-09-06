'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from '@/components/LocalizedLink'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Promo = {
  text: string
  url?: string
  /** Tailwind classes (bg-* ou gradient) */
  bg?: string
  /** Affichage conditionnel (ex: créneau horaire, stock, campagne) */
  condition?: () => boolean
}

interface BannerPromoProps {
  /** Message simple si tu ne veux pas de rotation */
  message?: string
  /** Styles prêts à l’emploi */
  variant?: 'brand' | 'yellow' | 'gray' | 'gradient'
  /** Persistance du “Fermer” (clé + TTL) */
  dismissKey?: string
  dismissTTLms?: number
  showCloseButton?: boolean
  /** Auto-hide de la bannière entière (en ms) */
  autoHideAfterMs?: number
  className?: string
  /** Collant sous le header */
  sticky?: boolean
  /** Liste d’offres rotatives (si fourni, prioritaire sur message) */
  promos?: Promo[]
  /** Intervalle de rotation (ms) */
  rotateMs?: number
  /** Met en pause la rotation au survol */
  pauseOnHover?: boolean
}

/** Offres par défaut – safe sans /fr dans l’URL */
const defaultPromos: Promo[] = [
  {
    text: '🎁 Livraison gratuite ce soir jusqu’à minuit !',
    url: '/produit',
    bg: 'bg-gradient-to-r from-brand via-brand/90 to-accent',
    condition: () => {
      const h = new Date().getHours()
      return h >= 18 && h <= 23
    },
  },
  {
    text: '🚚 Livraison rapide 48–72h sur tout TechPlay',
    url: '/categorie',
    bg: 'bg-gradient-to-r from-accent via-accent/90 to-brand',
  },
  {
    text: '⭐ Offres limitées sur nos best-sellers',
    url: '/categorie/best-sellers',
    bg: 'bg-gradient-to-r from-brand/90 to-accent',
  },
]

/** Lecture de la fermeture persistée (localStorage) */
function isDismissed(key: string, ttl: number) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const { ts } = JSON.parse(raw)
    return Date.now() - (Number(ts) || 0) < ttl
  } catch {
    // compat ancienne version (sessionStorage sans TTL)
    try {
      return sessionStorage.getItem(key) != null
    } catch {
      return false
    }
  }
}

export default function BannerPromo({
  message = '🚚 Livraison offerte dès 50 € d’achat – Profitez-en maintenant !',
  variant = 'gradient',
  dismissKey = 'promoDismissed',
  dismissTTLms = 1000 * 60 * 60 * 24, // 24h
  showCloseButton = true,
  autoHideAfterMs,
  className,
  sticky = false,
  promos,
  rotateMs = 6000,
  pauseOnHover = true,
}: BannerPromoProps) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [idx, setIdx] = useState(0)
  const pausedRef = useRef(false)

  /** Sélection des promos éligibles ou fallback message simple */
  const pool = useMemo<Promo[]>(() => {
    const base = promos && promos.length ? promos : defaultPromos
    const eligible = base.filter((p) => {
      try {
        return !p.condition || p.condition()
      } catch {
        return true
      }
    })
    if (eligible.length === 0) {
      return [{ text: message }]
    }
    return eligible
  }, [promos, message])

  /** Styles */
  const variantStyles: Record<NonNullable<BannerPromoProps['variant']>, string> = {
    brand:
      'bg-brand text-white dark:bg-zinc-900 dark:text-white',
    yellow:
      'bg-yellow-100 text-yellow-900 dark:bg-yellow-200 dark:text-yellow-900',
    gray:
      'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    gradient:
      'bg-gradient-to-r from-brand via-brand/90 to-accent text-white dark:from-zinc-900 dark:via-zinc-900 dark:to-brand',
  }

  /** Init visibilité (fermeture persistée) */
  useEffect(() => {
    if (isDismissed(dismissKey, dismissTTLms)) setVisible(false)
  }, [dismissKey, dismissTTLms])

  /** Auto-hide global */
  useEffect(() => {
    if (!autoHideAfterMs) return
    const t = setTimeout(() => setVisible(false), autoHideAfterMs)
    return () => clearTimeout(t)
  }, [autoHideAfterMs])

  /** Rotation des messages */
  useEffect(() => {
    if (pool.length <= 1) return
    if (prefersReducedMotion) return
    const t = setInterval(() => {
      if (pauseOnHover && pausedRef.current) return
      setIdx((i) => (i + 1) % pool.length)
    }, rotateMs)
    return () => clearInterval(t)
  }, [pool.length, rotateMs, prefersReducedMotion, pauseOnHover])

  /** Fermer + persister */
  const handleClose = useCallback(() => {
    try {
      localStorage.setItem(dismissKey, JSON.stringify({ ts: Date.now() }))
    } catch {}
    try {
      sessionStorage.setItem(dismissKey, '1') // compat ancienne version
    } catch {}
    setVisible(false)
  }, [dismissKey])

  /** ESC pour fermer */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    if (visible) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, handleClose])

  if (!visible) return null

  const current = pool[idx]
  const bgClass =
    current?.bg ??
    (variant === 'gradient' ? variantStyles.gradient : variantStyles[variant])

  return (
    <div
      className={cn(
        // conteneur plein écran, verre dépoli + ombres douces
        'w-full z-[65]',
        sticky && 'sticky top-0',
      )}
      role="region"
      aria-label="Promotion"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div
        className={cn(
          'px-3 sm:px-4 py-2',
          'backdrop-blur supports-[backdrop-filter]:bg-white/5',
          bgClass,
          className,
        )}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={idx + (current?.text || '')}
              initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.28 }}
              className="text-sm font-medium text-center"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {current?.url ? (
                <Link href={current.url} className="underline-offset-2 hover:underline focus:outline-none">
                  {current.text}
                </Link>
              ) : (
                <span className="truncate">{current?.text ?? message}</span>
              )}
            </motion.div>
          </AnimatePresence>

          {showCloseButton && (
            <button
              onClick={handleClose}
              className="shrink-0 rounded px-2 py-1 text-xs/none font-semibold bg-white/10 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60"
              aria-label="Fermer la bannière promotionnelle"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
