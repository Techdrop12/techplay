// src/components/cart/CartSummary.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import FreeShippingBadge from '@/components/FreeShippingBadge'

type CouponSpec =
  | { type: 'percent'; value: number }   // ex: 10 = -10%
  | { type: 'amount'; value: number }    // ex: 5  = -5 €
  | { type: 'freeship' }                 // livraison offerte

interface CartSummaryProps {
  items: (Product & { quantity: number })[]
  /** Taux de TVA (ex: 0.2 = 20%). Mettre 0 si prix TTC déjà fournis. */
  taxRate?: number
  /** Seuil de livraison gratuite (par défaut depuis l'env ou 49€) */
  shippingThreshold?: number
  /** Frais de livraison de base si sous le seuil */
  shippingFee?: number
  /** Dictionnaire de codes promos disponibles (clé = code) */
  couponCodes?: Record<string, CouponSpec>
  /** Callback optionnel quand un coupon est appliqué */
  onCouponApplied?: (code: string) => void
  className?: string
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const LS_COUPON_KEY = 'cart_coupon_code'

const DEFAULT_COUPONS: Record<string, CouponSpec> = {
  WELCOME10: { type: 'percent', value: 10 },
  VIP20: { type: 'percent', value: 20 },
  FREESHIP: { type: 'freeship' },
}

export default function CartSummary({
  items,
  taxRate = 0.2,
  shippingThreshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  shippingFee = 4.9,
  couponCodes = DEFAULT_COUPONS,
  onCouponApplied,
  className = '',
}: CartSummaryProps) {
  const [code, setCode] = useState<string>('')
  const [applied, setApplied] = useState<string>('')
  const [msg, setMsg] = useState<string>('')
  const srRef = useRef<HTMLParagraphElement | null>(null)

  // Hydrate code appliqué depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(LS_COUPON_KEY) || ''
    if (saved && couponCodes[saved.toUpperCase()]) {
      setApplied(saved.toUpperCase())
    }
  }, [couponCodes])

  const subtotal = useMemo(
    () =>
      (items || []).reduce(
        (acc, item) => acc + (Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1),
        0
      ),
    [items]
  )

  // Applique la remise
  const discount = useMemo(() => {
    if (!applied) return 0
    const spec = couponCodes[applied]
    if (!spec) return 0
    if (spec.type === 'percent') {
      return round2((subtotal * spec.value) / 100)
    }
    if (spec.type === 'amount') {
      return round2(Math.min(spec.value, subtotal))
    }
    return 0
  }, [applied, couponCodes, subtotal])

  // Base pour TVA & seuil livraison (après remise)
  const taxableBase = Math.max(0, subtotal - discount)

  // Livraison (gratuite si seuil atteint ou code FREESHIP)
  const isFreeShip = taxableBase >= shippingThreshold || (applied && couponCodes[applied]?.type === 'freeship')
  const shipping = isFreeShip ? 0 : shippingFee

  // TVA (si tu fournis déjà TTC, passe taxRate=0)
  const tax = round2(taxRate > 0 ? taxableBase * taxRate : 0)

  const total = round2(taxableBase + tax + shipping)
  const savings = round2(discount + (isFreeShip ? shippingFee : 0))

  const itemsCount = useMemo(
    () => (items || []).reduce((s, it) => s + Math.max(1, Number(it.quantity || 1)), 0),
    [items]
  )

  const applyCoupon = (raw: string) => {
    const c = (raw || '').trim().toUpperCase()
    if (!c) return
    if (!couponCodes[c]) {
      setMsg('Code invalide.')
      announce('Code promo invalide')
      return
    }
    setApplied(c)
    setMsg('Code appliqué ✔︎')
    announce(`Code ${c} appliqué`)
    if (typeof window !== 'undefined') localStorage.setItem(LS_COUPON_KEY, c)
    onCouponApplied?.(c)
  }

  const removeCoupon = () => {
    const prev = applied
    setApplied('')
    setMsg('Code retiré.')
    announce('Code promo retiré')
    if (typeof window !== 'undefined') localStorage.removeItem(LS_COUPON_KEY)
    if (prev && couponCodes[prev]?.type === 'freeship') {
      // facultatif : message supplémentaire
    }
  }

  const announce = (text: string) => {
    if (!srRef.current) return
    srRef.current.textContent = text
  }

  return (
    <section
      className={cn(
        'space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-700',
        className
      )}
      role="region"
      aria-labelledby="cart-summary-title"
    >
      {/* Live region (screen readers) */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <h2
        id="cart-summary-title"
        className="text-xl font-bold text-gray-900 dark:text-white"
      >
        🧾 Résumé de la commande
      </h2>

      {/* Badge progression livraison gratuite */}
      <div className="pt-1">
        <FreeShippingBadge price={taxableBase} withProgress />
      </div>

      {/* Lignes montants */}
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <Row label={`Sous-total (${itemsCount} article${itemsCount > 1 ? 's' : ''})`} value={formatPrice(subtotal)} />
        {discount > 0 && (
          <Row
            label={`Remise${applied ? ` (${applied})` : ''}`}
            value={`- ${formatPrice(discount)}`}
            valueClass="text-emerald-600 dark:text-emerald-400 font-semibold"
          />
        )}
        <Row label="TVA (est.)" value={taxRate > 0 ? formatPrice(tax) : '—'} />
        <Row label="Livraison" value={shipping === 0 ? 'Offerte' : formatPrice(shipping)} />
        <hr className="border-gray-300 dark:border-zinc-700 my-3" />
        <Row label="Total" value={formatPrice(total)} bold big />
      </div>

      {/* Économies affichées si pertinentes */}
      {savings > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Vous économisez {formatPrice(savings)} {applied ? `avec le code ${applied}` : ''}.
        </p>
      )}

      {/* Code promo */}
      <div className="mt-4">
        {applied ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-300/70 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Code appliqué&nbsp;: {applied}
            </span>
            <button
              onClick={removeCoupon}
              className="text-emerald-700/90 hover:underline dark:text-emerald-300"
              aria-label="Retirer le code promo"
            >
              Retirer
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              applyCoupon(code)
            }}
            aria-label="Appliquer un code promo"
          >
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="Code promo"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
              aria-label="Appliquer le code promo"
            >
              Appliquer
            </button>
          </form>
        )}
        {msg && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" role="status">{msg}</p>}
      </div>

      {/* Petit rappel légal/expédition */}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        Les montants indiqués sont estimatifs. Les frais et taxes définitifs sont calculés à l’étape
        de paiement. La livraison est offerte à partir de {formatPrice(shippingThreshold)} après remise.
      </p>
    </section>
  )
}

function Row({
  label,
  value,
  bold = false,
  big = false,
  valueClass = '',
}: {
  label: string
  value: string
  bold?: boolean
  big?: boolean
  valueClass?: string
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn('text-gray-700 dark:text-gray-300', bold && 'font-semibold', big && 'text-base')}>
        {label}
      </span>
      <span
        className={cn('tabular-nums text-gray-900 dark:text-white', bold && 'font-semibold', big && 'text-lg', valueClass)}
        aria-label={label}
      >
        {value}
      </span>
    </div>
  )
}
