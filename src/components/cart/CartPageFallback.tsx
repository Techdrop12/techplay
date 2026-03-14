'use client'

import { useTranslations } from 'next-intl'

export default function CartPageFallback() {
  const t = useTranslations('common')
  return <div className="py-16 text-center">{t('loading')}</div>
}
