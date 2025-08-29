// src/components/StickyCartSummary.tsx — PREMIUM (no emoji, SVG icons, a11y/SEO ok)
'use client'

import Link from '@/components/LocalizedLink'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/formatPrice'
import { event, logEvent } from '@/lib/ga'
import { useTranslations } from 'next-intl'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

type AppLocale = 'fr' | 'en'

type Props = {
  locale?: AppLocale
  cartHref?: string        // ex: '/cart'
  checkoutHref?: string    // ex: '/commande'
  excludePaths?: string[]
  freeShippingThreshold?: number
  className?: string
}

/* ------------------------ Inline SVG icons (no emoji) ------------------------ */
function IconLock({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-8-2a3 3 0 1 1 6 0v2H9V7Zm9 12H6v-8h10v8Zm-5-3a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
      />
    </svg>
  )
}
function IconRocket({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M14 3c3.31 0 6 2.69 6 6c0 1.66-.67 3.16-1.76 4.24l-.8.8l-2.12-2.12l.8-.8A3.98 3.98 0 0 0 18 9a4 4 0 0 0-4-4c-1.1 0-2.1.45-2.83 1.17l-.8.8L8.24 4.83l.8-.8A5.96 5.96 0 0 1 14 3ZM5.41 6.59 9 10.17L7.59 11.6l-2.83-.71l-.71-2.83l1.36-1.47Zm12.72 12.72L16.83 18L15.4 19.41l.71 2.83l2.83.71l1.47-1.36ZM10.17 15 6.59 18.59l-1.47 1.36l2.83.71l.71 2.83l1.36-1.47L14 13.83L10.17 15Zm6.54-9.71a1.5 1.5 0 1 1-2.12 2.12a1.5 1.5 0 0 1 2.12-2.12Z"
      />
    </svg>
  )
}
function IconHeadset({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 3a8 8 0 0 0-8 8v2a2 2 0 0 0 2 2h1v-5a5 5 0 1 1 10 0v5h1a2 2 0 0 0 2-2v-2a8 8 0 0 0-8-8ZM8 15H6a1 1 0 0 1-1-1v-1h3v2Zm11-2v1a1 1 0 0 1-1 1h-2v-2h3Zm-5 4h-2v1a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4v-1Z"
      />
    </svg>
  )
}

/* --------------------------------------------------------------------------- */

export default function StickyCartSummary({
  locale,
  cartHref,
  checkoutHref,
  excludePaths = ['/checkout', '/commande', '/cart', '/panier', '/404', '/_not-found'],
  freeShippingThreshold,
  className,
}: Props) {
  // ── TOUS les hooks sont appelés inconditionnellement (pas d’early return avant)
  const pathname = usePathname() || ''
  const detectedLocale = getCurrentLocale(pathname) as AppLocale
  const loc: AppLocale = locale ?? detectedLocale
  const prefersReduced = useReducedMotion()

  // i18n (fallback si pas de provider) — sans emoji
  let t: any
  try {
    t = useTranslations('cart')
  } catch {
    t = ((key: string, _v?: Record<string, any>) => {
      const dict: Record<string, string> = {
        mobile_summary: 'Résumé de votre panier',
        show: 'Afficher',
        hide: 'Masquer',
        item: 'article',
        total: 'Total',
        free_shipping: 'Livraison offerte',
        free_shipping_progress: 'Progression vers la livraison offerte',
        free_shipping_remaining: 'Plus que {amount} pour la livraison gratuite.',
        free_shipping_unlocked: 'Bravo ! La livraison est offerte.',
        view_cart: 'Voir le panier',
        checkout: 'Commander',
        secure_payment: 'Paiement sécurisé',
        fast_shipping: '48h',
        support: 'Support 7j/7',
        subtotal: 'Sous-total',
        discount: 'Remise',
        vat: 'TVA (est.)',
        shipping: 'Livraison',
      }
      return dict[key] ?? key
    }) as any
  }
  const tx = (key: string, fallback: string, values?: Record<string, any>) => {
    try { return values ? t(key as any, values as any) : (t(key as any) as any) } catch { return fallback }
  }

  // Panier (du contexte)
  const {
    cart,
    count,
    total,
    discount,
    tax,
    shipping,
    grandTotal,
    amountToFreeShipping,
    progressToFreeShipping,
    freeShippingThreshold: ctxThreshold,
  } = useCart()

  // Seuil livraison offerte
  const FREE_SHIP = useMemo(() => {
    if (typeof freeShippingThreshold === 'number' && freeShippingThreshold > 0) return freeShippingThreshold
    if (typeof ctxThreshold === 'number' && ctxThreshold > 0) return ctxThreshold
    const env = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD)
    return Number.isFinite(env) && env > 0 ? env : 50
  }, [freeShippingThreshold, ctxThreshold])

  // Totaux dérivés (avec garde-fous)
  const subtotal = useMemo(
    () => (Number.isFinite(total) ? total : (cart ?? []).reduce((s, it: any) => s + (it?.price || 0) * (it?.quantity || 1), 0)),
    [total, cart]
  )
  const remaining = useMemo(
    () => (Number.isFinite(amountToFreeShipping) ? amountToFreeShipping : Math.max(0, FREE_SHIP - subtotal)),
    [amountToFreeShipping, FREE_SHIP, subtotal]
  )
  const progress = useMemo(
    () => (Number.isFinite(progressToFreeShipping) ? progressToFreeShipping : Math.min(100, Math.round((subtotal / FREE_SHIP) * 100))),
    [progressToFreeShipping, subtotal, FREE_SHIP]
  )
  const payable = useMemo(
    () => (Number.isFinite(grandTotal) ? grandTotal : subtotal + (Number.isFinite(shipping) ? shipping : 0) + (Number.isFinite(tax) ? tax : 0)),
    [grandTotal, subtotal, shipping, tax]
  )

  // État UI + persistance
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    setMounted(true)
    try { const saved = localStorage.getItem('tp_cart_sticky_collapsed'); if (saved === '1') setCollapsed(true) } catch {}
  }, [])
  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v)
    try { localStorage.setItem('tp_cart_sticky_collapsed', v ? '1' : '0') } catch {}
  }

  // Écoute l’événement global “cart-added” pour déplier brièvement
  useEffect(() => {
    const onAdded = () => {
      setCollapsedPersist(false)
      if (!prefersReduced) {
        try {
          const el = document.querySelector('[data-visible="true"]') as HTMLElement | null
          el?.animate?.([{ boxShadow: '0 0 0 0 rgba(16,185,129,0.0)' }, { boxShadow: '0 0 0 10px rgba(16,185,129,0.25)' }, { boxShadow: '0 0 0 0 rgba(16,185,129,0.0)' }], { duration: 800, easing: 'ease-out' })
        } catch {}
      }
    }
    window.addEventListener('cart-added', onAdded as EventListener)
    return () => window.removeEventListener('cart-added', onAdded as EventListener)
  }, [prefersReduced])

  // Visibilité + routes exclues (évaluées APRÈS tous les hooks)
  const visible = mounted && (count ?? 0) > 0
  const gotoCart = useMemo(() => localizePath(cartHref || '/cart', loc), [cartHref, loc])
  const gotoCheckout = useMemo(() => localizePath(checkoutHref || '/commande', loc), [checkoutHref, loc])
  const isExcluded = useMemo(
    () => excludePaths.some((p) => pathname.startsWith(localizePath(p, loc))),
    [excludePaths, pathname, loc]
  )

  // Tracking apparition
  const trackedRef = useRef(false)
  useEffect(() => {
    if (visible && !trackedRef.current) {
      trackedRef.current = true
      try { event({ action: 'sticky_cart_visible', category: 'engagement', label: 'sticky_cart', value: count }) } catch {}
    }
  }, [visible, count])

  const onCta = (label: string) => {
    try {
      event({ action: 'sticky_cart_click', category: 'engagement', label, value: subtotal })
      logEvent?.('sticky_cart_click', { page: pathname, cart_count: count, total_price: subtotal, label })
    } catch {}
  }

  // ⛔️ Masquage APRÈS les hooks → pas d’erreur React #300
  if (!visible || isExcluded) return null

  // Affichage “Livraison” robuste (indéfinie / offerte / prix)
  const shippingDisplay =
    Number.isFinite(shipping) ? (shipping === 0 ? 'Offerte' : formatPrice(shipping as number)) : '—'

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="sticky-cart"
        initial={prefersReduced ? { y: 0, opacity: 1 } : { y: 72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={prefersReduced ? { y: 0, opacity: 0 } : { y: 72, opacity: 0 }}
        transition={prefersReduced ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 26 }}
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
        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            type="button"
            onClick={() => setCollapsedPersist(!collapsed)}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] rounded-md px-1 -mx-1"
            aria-expanded={!collapsed}
            aria-controls="sticky-cart-panel"
          >
            {collapsed ? tx('show', 'Afficher') : tx('hide', 'Masquer')} · {count}{' '}
            {tx('item', (count ?? 0) > 1 ? 'articles' : 'article', { count })}
          </button>

          <div className="text-sm text-gray-800 dark:text-gray-100" aria-live="polite">
            {tx('total', 'Total')} : <strong className="ml-1">{formatPrice(payable)}</strong>
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
                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                  <span>{tx('free_shipping', 'Livraison offerte')}</span>
                  <span aria-hidden="true">{progress}%</span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-zinc-800"
                  aria-label={tx('free_shipping_progress', 'Progression vers la livraison offerte')}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <motion.div
                    className={cn('h-full rounded-full', progress >= 100 ? 'bg-green-500' : 'bg-[hsl(var(--accent))]')}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>

                <p
                  className={cn(
                    'mt-2 text-xs',
                    remaining > 0 ? 'text-gray-600 dark:text-gray-300' : 'text-green-600 dark:text-green-400 font-semibold'
                  )}
                  aria-live="polite"
                >
                  {remaining > 0
                    ? tx('free_shipping_remaining', 'Plus que {amount} pour la livraison gratuite.', {
                        amount: formatPrice(remaining),
                      })
                    : tx('free_shipping_unlocked', 'Bravo ! La livraison est offerte.')}
                </p>
              </div>

              {/* Lignes montants */}
              <div className="px-4 pt-2 text-[13px] text-gray-700 dark:text-gray-300 space-y-1">
                <Line label={tx('subtotal', 'Sous-total')} value={formatPrice(subtotal)} />
                {discount > 0 && <Line label={tx('discount', 'Remise')} value={`- ${formatPrice(discount)}`} accent />}
                <Line label={tx('vat', 'TVA (est.)')} value={Number.isFinite(tax) && (tax as number) > 0 ? formatPrice(tax as number) : '—'} />
                <Line label={tx('shipping', 'Livraison')} value={shippingDisplay} />
                <div className="my-2 border-t border-gray-300 dark:border-zinc-700" />
                <Line label={tx('total', 'Total')} value={formatPrice(payable)} bold />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2 px-4 py-3">
                <Link
                  href={gotoCart}
                  onClick={() => onCta('voir_panier')}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  aria-label={tx('view_cart', 'Voir le panier')}
                >
                  {tx('view_cart', 'Voir le panier')}
                </Link>
                <Link
                  href={gotoCheckout}
                  onClick={() => onCta('commander')}
                  className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--accent))] text-white px-3 py-2 text-sm font-extrabold shadow-md hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                  aria-label={tx('checkout', 'Commander')}
                >
                  {tx('checkout', 'Commander')} →
                </Link>
              </div>

              {/* Trust line (no emoji) */}
              <div className="px-4 pb-3 -mt-1">
                <ul className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-1.5">
                    <IconLock className="text-gray-600 dark:text-gray-300" />
                    <span>{tx('secure_payment', 'Paiement sécurisé')}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <IconRocket className="text-gray-600 dark:text-gray-300" />
                    <span>{tx('fast_shipping', '48h')}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <IconHeadset className="text-gray-600 dark:text-gray-300" />
                    <span>{tx('support', 'Support 7j/7')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </AnimatePresence>
  )
}

function Line({
  label,
  value,
  bold = false,
  accent = false,
}: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-gray-700 dark:text-gray-300', bold && 'font-semibold')}>{label}</span>
      <span
        className={cn(
          'tabular-nums text-gray-900 dark:text-white',
          bold && 'font-semibold',
          accent && 'text-emerald-600 dark:text-emerald-400 font-semibold'
        )}
        aria-label={label}
      >
        {value}
      </span>
    </div>
  )
}
