// src/components/AddToCartButtonAB.tsx — A/B wrapper (A = add, B = buy now) — FIXED
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'
import { pixelInitiateCheckout } from '@/lib/meta-pixel'
import type { Product } from '@/types/product'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'> & {
  quantity?: number
}

type VariantConfig = { label: string; instantCheckout?: boolean }

interface Props {
  product: MinimalProduct
  locale?: string
  testKey?: string
  ttlDays?: number
  variants?: Record<string, VariantConfig>
  className?: string
  // …les autres props sont forwardées à AddToCartButton via {...rest}
  [k: string]: any
}

const SEEN = new Set<string>()
const dedupe = (sig: string, ms = 1000) => {
  if (SEEN.has(sig)) return true
  SEEN.add(sig)
  setTimeout(() => SEEN.delete(sig), ms)
  return false
}

// Mini helper monnaie pour l’event “buy now”
function detectCurrency(locale?: string): 'EUR' | 'GBP' | 'USD' {
  if (locale && locale.startsWith('en')) return 'USD'
  return 'EUR'
}

export default function AddToCartButtonAB({
  product,
  locale = 'fr',
  testKey = 'add_to_cart_cta',
  ttlDays = 60,
  variants,
  className,
  ...rest
}: Props) {
  const presets: Record<string, VariantConfig> =
    variants ??
    (locale === 'fr'
      ? {
          A: { label: 'Ajouter au panier', instantCheckout: false },
          B: { label: '🛒 Commander maintenant', instantCheckout: true },
        }
      : {
          A: { label: 'Add to cart', instantCheckout: false },
          B: { label: '🛒 Buy now', instantCheckout: true },
        })

  const keys = useMemo(() => Object.keys(presets), [presets])
  const [variant, setVariant] = useState<string | null>(null)
  const assignedRef = useRef(false)

  // Assignation A/B (une seule fois)
  useEffect(() => {
    const v = getABVariant(testKey, keys, { ttlDays, allowUrlOverride: true })
    setVariant(v)
    if (!assignedRef.current) {
      assignedRef.current = true
      try {
        pushDataLayer({ event: 'ab_assign', ab_name: testKey, ab_variant: v })
        logEvent('ab_assign', { ab_name: testKey, ab_variant: v })
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testKey])

  // Impression CTA
  useEffect(() => {
    if (!variant) return
    const sig = `ab_impression:${testKey}:${variant}:${product._id}`
    if (dedupe(sig, 1500)) return
    try {
      pushDataLayer({ event: 'ab_impression', ab_name: testKey, ab_variant: variant, pid: product._id })
      logEvent('ab_impression', { ab_name: testKey, ab_variant: variant, pid: product._id })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  if (!variant) return null
  const conf = presets[variant] || presets[keys[0]]

  // Tracking click CTA (pas d’envoi Pixel AddToCart ici → on laisse le bouton le faire après succès)
  const handleWrapperClick = useCallback(
    async (e: any) => {
      const base = {
        ab_name: testKey,
        ab_variant: variant,
        pid: product._id,
        price: product.price,
        slug: product.slug,
      }

      try {
        pushDataLayer({ event: 'cta_click', cta: 'add_to_cart_ab', ...base })
        logEvent('cta_click', { cta: 'add_to_cart_ab', ...base })
      } catch {}

      // Variant B → “Buy now” : Pixel InitiateCheckout
      if (conf.instantCheckout) {
        try {
          pushDataLayer({ event: 'buy_now_click', ...base })
          logEvent('buy_now_click', base)
          pixelInitiateCheckout({
            value: Number(product.price) || undefined,
            currency: detectCurrency(locale),
            num_items: 1,
            contents: [
              {
                id: String(product._id || product.slug),
                quantity: Number(product.quantity || 1),
                item_price: Number(product.price),
              },
            ],
          })
        } catch {}
      }

      // Si le parent a passé un onClick au wrapper AB, on l'appelle quand même
      if (typeof rest?.onClick === 'function') {
        try {
          await rest.onClick(e)
        } catch {}
      }
    },
    [conf.instantCheckout, locale, product, testKey, variant, rest]
  )

  return (
    // className "contents" = pas de boîte supplémentaire (Tailwind)
    <span className="contents" onClickCapture={handleWrapperClick}>
      <AddToCartButton
        product={product}
        locale={locale}
        idleText={conf.label}
        instantCheckout={!!conf.instantCheckout}
        className={className}
        gtmExtra={{ ab_name: testKey, ab_variant: variant, ...(rest?.gtmExtra || {}) }}
        {...rest}
      />
    </span>
  )
}
