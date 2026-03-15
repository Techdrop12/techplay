import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Metadata } from 'next'

import CartPageClient from '@/components/cart/CartPageClient'
import CartPageFallback from '@/components/cart/CartPageFallback'
import { generateMeta } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  return generateMeta({
    title: t('cart_title'),
    description: t('cart_description'),
    url: '/cart',
    noindex: true,
  })
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageFallback />}>
      <CartPageClient />
    </Suspense>
  )
}
