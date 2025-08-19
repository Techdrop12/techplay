'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/cartContext'
import { formatPrice, cn } from '@/lib/utils'
import { event, logEvent } from '@/lib/ga'
import { useTranslations } from 'next-intl'

type Props = {
  locale?: string
  cartHref?: string
  excludePaths?: string[]
  freeShippingThreshold?: number
  className?: string
}

/**
 * StickyCartSummary — résumé panier mobile full option
 * - Mobile only (md:hidden), safe-area iOS, blur, spring anim
 * - Masqué sur /checkout, /commande, /cart, /panier, /404, /_not-found (configurable)
 * - État plié/déplié persistant (localStorage)
 * - Progress “livraison offerte” (env NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ou prop)
 * - a11y + aria-live
 * - Tracking GA4 + logEvent custom
 * - ✅ Robuste: ne casse pas si next-intl Provider est absent (prerender 404)
 */
export default function StickyCartSummary({
  locale = 'fr',
  cartHref,
  excludePaths = ['/checkout', '/commande', '/cart', '/panier', '/404', '/_not-found'],
  freeShippingThreshold,
  className,
}: Props) {
  // ⚠️ next-intl peut ne pas être initialisé (ex: _not-found en prerender).
  // On tente le hook; s’il jette, on met un stub qui jette aussi,
  // et notre helper `tx()` retournera le fallback.
  let t: any
  try {
    t = useTranslations('cart')
  } catch {
    t = (() => {
      throw new Error('next-intl provider missing')
    }) as any
  }

  // helper i18n avec fallback (PAS d’exception si pas de provider)
  const tx = (key: string, fallback: string, values?: Record<string, any>) => {
    try {
      return values ? t(key as any, values as any) : (t(key as any) as any)
    } catch {
      return fallback
    }
  }

  const pathname = usePathname() || ''
  const { cart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Seuil livraison offerte
  const FREE_SHIPPING_THRESHOLD = useMemo(() => {
    if (typeof freeShippingThreshold === 'number' && freeShippingThreshold > 0) {
      return freeShippingThreshold
    }
    const env = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD)
    return Number.isFinite(env) && env > 0 ? env : 50
  }, [freeShippingThreshold])

  // Mémorisation UI
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('tp_cart_sticky_collapsed')
      if (saved === '1') setCollapsed(true)
    } catch {}
  }, [])

  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v)
    try {
      localStorage.setItem('tp_cart_sticky_collapsed', v ? '1' : '0')
    } catch {}
  }

  // Totaux
  const { count, subtotal } = useMemo(() => {
    const c = cart?.reduce((n: number, it: any) => n + (it?.quantity || 1), 0) || 0
    const s =
      cart?.reduce((sum: number, it: any) => sum + (it?.price || 0) * (it?.quantity || 1), 0) || 0
    return { count: c, subtotal: s }
  }, [cart])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  // Affichage uniquement si items + path autorisé
  const visible = useMemo(() => {
    if (!mounted || !count) return false
    return !excludePaths.some((p) => pathname.includes(p))
  }, [mounted, count, pathname, excludePaths])

  // Tracking à l’apparition
  const trackedRef = useRef(false)
  useEffect(() => {
    if (visible && !trackedRef.current) {
      trackedRef.current = true
      event({
        action: 'sticky_cart_visible',
        category: 'engagement',
        label: 'sticky_cart',
        value: count,
      })
    }
  }, [visible, count])

  const goto = cartHref || '/commande'
  const onCta = (label: string) => {
    event({ action: 'sticky_cart_click', category: 'engagement', label, value: subtotal })
    logEvent?.('sticky_cart_click', {
      page: pathname,
      cart_count: count,
      total_price: subtotal,
      label,
    })
  }

  if (!visible) return null

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="sticky-cart"
        initial={{ y: 72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 72, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-[60]',
          'backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-zinc-900/85',
          'border-t border-gray-200 dark:border-zinc-800 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]',
          'pb-[env(safe-area-inset-bottom)]',
          className
        )}
        role="region"
        aria-label={tx('mobile_summary', 'Résumé de votre panier', { count })}
        data-visible="true"
      >
        {/* Barre supérieure : toggle + total */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            type="button"
            onClick={() => setCollapsedPersist(!collapsed)}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-1 -mx-1"
            aria-expanded={!collapsed}
            aria-controls="sticky-cart-panel"
          >
            {collapsed ? tx('show', 'Afficher') : tx('hide', 'Masquer')} · {count}{' '}
            {tx('item', count > 1 ? 'articles' : 'article', { count })}
          </button>

          <div className="text-sm text-gray-800 dark:text-gray-100" aria-live="polite">
            {tx('total', 'Total')} : <strong className="ml-1">{formatPrice(subtotal)}</strong>
          </div>
        </div>

        {/* Panneau détaillé */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              id="sticky-cart-panel"
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Progress “livraison offerte” */}
              <div className="px-4 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 mb-1">
                  <span>{tx('free_shipping', 'Livraison offerte')}</span>
                  <span aria-hidden="true">{progress}%</span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-zinc-800 overflow-hidden"
                  aria-label={tx('free_shipping_progress', 'Progression vers la livraison offerte')}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <motion.div
                    className={cn('h-full rounded-full', progress >= 100 ? 'bg-green-500' : 'bg-accent')}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>

                <p
                  className={cn(
                    'mt-2 text-xs',
                    remaining > 0
                      ? 'text-gray-600 dark:text-gray-300'
                      : 'text-green-600 dark:text-green-400 font-semibold'
                  )}
                  aria-live="polite"
                >
                  {remaining > 0
                    ? tx('free_shipping_remaining', 'Plus que {amount} pour la livraison gratuite.', {
                        amount: formatPrice(remaining),
                      })
                    : tx('free_shipping_unlocked', 'Bravo ! La livraison est offerte 🎉')}
                </p>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2 px-4 py-3">
                <Link
                  href={goto}
                  onClick={() => onCta('voir_panier')}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={tx('view_cart', 'Voir le panier')}
                >
                  {tx('view_cart', 'Voir le panier')}
                </Link>
                <Link
                  href={goto}
                  onClick={() => onCta('commander')}
                  className="inline-flex items-center justify-center rounded-lg bg-accent text-white px-3 py-2 text-sm font-extrabold shadow-md hover:bg-accent/90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={tx('checkout', 'Commander')}
                >
                  {tx('checkout', 'Commander')} →
                </Link>
              </div>

              {/* Trust line */}
              <div className="px-4 pb-3 -mt-1">
                <ul className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-1">✅ {tx('secure_payment', 'Paiement sécurisé')}</li>
                  <li className="flex items-center gap-1">🚀 {tx('fast_shipping', '48h')}</li>
                  <li className="flex items-center gap-1">💬 {tx('support', 'Support 7j/7')}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </AnimatePresence>
  )
}
