'use client'

import SEOHead from '@/components/SEOHead'
import { useTranslations } from 'next-intl'

export default function Contact() {
  const t = useTranslations('contact')

  return (
    <>
      <SEOHead
        titleKey="seo.contact_title"
        descriptionKey="seo.contact_description"
      />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p>
          {t('intro')}{' '}
          <a href="mailto:support@techplay.com" className="text-blue-500 underline">
            support@techplay.com
          </a>
        </p>
      </div>
    </>
  )
}
