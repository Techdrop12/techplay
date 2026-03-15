'use client'

import { useTranslations } from 'next-intl'

import Link from '@/components/LocalizedLink'

export default function EmptyWishlist() {
  const t = useTranslations('wishlist')

  return (
    <div className="text-center py-16 text-token-text/70" role="status">
      <p className="mb-4">{t('empty')}</p>
      <Link
        href="/products"
        prefetch={false}
        className="text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
      >
        {t('cta_products')}
      </Link>
    </div>
  )
}
