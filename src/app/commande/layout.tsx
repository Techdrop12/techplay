import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { generateMeta } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  return generateMeta({
    title: t('commande_title'),
    description: t('commande_description'),
    url: '/commande',
    noindex: true,
  })
}

export default function CommandeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
