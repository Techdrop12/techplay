import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { generateMeta } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  return generateMeta({
    title: t('success_title'),
    description: t('success_description'),
    url: '/success',
    noindex: true,
  })
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
