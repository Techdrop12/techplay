// src/components/AddToCartButtonAB.tsx — A/B wrapper (A = add, B = buy now)
'use client'

import { useEffect, useMemo, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { getABVariant } from '@/lib/ab-test'
import { logEvent, pushDataLayer } from '@/lib/ga'
import type { Product } from '@/types/product'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'> & { quantity?: number }

type VariantConfig = { label: string; instantCheckout?: boolean }

interface Props {
  product: MinimalProduct
  locale?: string
  testKey?: string
  ttlDays?: number
  variants?: Record<string, VariantConfig>
  className?: string
  // …tous les autres props AddToCartButton sont passés via rest
  [k: string]: any
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

  useEffect(() => {
    const v = getABVariant(testKey, keys, { ttlDays, allowUrlOverride: true })
    setVariant(v)
    // Track assignation (une seule fois)
    try {
      pushDataLayer({ event: 'ab_assign', ab_name: testKey, ab_variant: v })
      logEvent('ab_assign', { ab_name: testKey, ab_variant: v })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testKey])

  if (!variant) return null
  const conf = presets[variant] || presets[keys[0]]

  return (
    <AddToCartButton
      product={product}
      locale={locale}
      idleText={conf.label}
      instantCheckout={!!conf.instantCheckout}
      className={className}
      gtmExtra={{ ab_name: testKey, ab_variant: variant, ...(rest?.gtmExtra || {}) }}
      {...rest}
    />
  )
}
