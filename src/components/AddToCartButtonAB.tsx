'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Product } from '@/types/product'

import AddToCartButton from '@/components/AddToCartButton'
import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'
import { pixelInitiateCheckout } from '@/lib/meta-pixel'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'> & {
  quantity?: number
}

type VariantConfig = {
  label: string
  instantCheckout?: boolean
}

interface Props {
  product: MinimalProduct
  locale?: string
  testKey?: string
  ttlDays?: number
  variants?: Record<string, VariantConfig>
  className?: string
  [k: string]: unknown
}

const SEEN = new Set<string>()

function dedupe(sig: string, ms = 1000) {
  if (SEEN.has(sig)) return true
  SEEN.add(sig)
  window.setTimeout(() => SEEN.delete(sig), ms)
  return false
}

function detectCurrency(locale?: string): 'EUR' | 'GBP' | 'USD' {
  if (!locale) return 'EUR'

  const normalized = locale.toLowerCase()

  if (normalized.includes('gb') || normalized.includes('uk') || normalized === 'en-gb') {
    return 'GBP'
  }

  if (normalized.startsWith('en')) {
    return 'USD'
  }

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
  const presets = useMemo<Record<string, VariantConfig>>(() => {
    if (variants && Object.keys(variants).length > 0) return variants

    return locale === 'fr'
      ? {
          A: { label: 'Ajouter au panier', instantCheckout: false },
          B: { label: '🛒 Commander maintenant', instantCheckout: true },
        }
      : {
          A: { label: 'Add to cart', instantCheckout: false },
          B: { label: '🛒 Buy now', instantCheckout: true },
        }
  }, [locale, variants])

  const keys = useMemo(() => Object.keys(presets), [presets])
  const [variant, setVariant] = useState<string | null>(null)
  const assignedRef = useRef(false)

  useEffect(() => {
    if (keys.length === 0) return

    const selected = getABVariant(testKey, keys, {
      ttlDays,
      allowUrlOverride: true,
    })

    setVariant(selected)

    if (!assignedRef.current) {
      assignedRef.current = true

      try {
        pushDataLayer({
          event: 'ab_assign',
          ab_name: testKey,
          ab_variant: selected,
        })

        logEvent('ab_assign', {
          ab_name: testKey,
          ab_variant: selected,
        })
      } catch {}
    }
  }, [keys, testKey, ttlDays])

  useEffect(() => {
    if (!variant) return

    const sig = `ab_impression:${testKey}:${variant}:${product._id}`
    if (dedupe(sig, 1500)) return

    try {
      pushDataLayer({
        event: 'ab_impression',
        ab_name: testKey,
        ab_variant: variant,
        pid: product._id,
      })

      logEvent('ab_impression', {
        ab_name: testKey,
        ab_variant: variant,
        pid: product._id,
      })
    } catch {}
  }, [product._id, testKey, variant])

  const conf = useMemo(() => {
    if (!variant) return null
    return presets[variant] ?? presets[keys[0]] ?? null
  }, [keys, presets, variant])

  const forwardedOnClick =
    typeof rest.onClick === 'function'
      ? (rest.onClick as (event: unknown) => unknown | Promise<unknown>)
      : undefined

  const extraGtm =
    typeof rest.gtmExtra === 'object' && rest.gtmExtra !== null
      ? (rest.gtmExtra as Record<string, unknown>)
      : {}

  const handleWrapperClick = useCallback(
    async (event: unknown) => {
      if (!conf) return

      const base = {
        ab_name: testKey,
        ab_variant: variant,
        pid: product._id,
        price: product.price,
        slug: product.slug,
      }

      try {
        pushDataLayer({
          event: 'cta_click',
          cta: 'add_to_cart_ab',
          ...base,
        })

        logEvent('cta_click', {
          cta: 'add_to_cart_ab',
          ...base,
        })
      } catch {}

      if (conf.instantCheckout) {
        try {
          pushDataLayer({
            event: 'buy_now_click',
            ...base,
          })

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

      if (forwardedOnClick) {
        try {
          await forwardedOnClick(event)
        } catch {}
      }
    },
    [conf, forwardedOnClick, locale, product, testKey, variant]
  )

  if (!variant || !conf) return null

  return (
    <span className="contents" onClickCapture={handleWrapperClick}>
      <AddToCartButton
        {...rest}
        product={product}
        locale={locale}
        idleText={conf.label}
        instantCheckout={Boolean(conf.instantCheckout)}
        className={className}
        gtmExtra={{
          ab_name: testKey,
          ab_variant: variant,
          ...extraGtm,
        }}
      />
    </span>
  )
}