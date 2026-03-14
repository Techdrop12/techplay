'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface FAQItem {
  q?: string
  a?: string
}

interface FAQBlockProps {
  productId: string
}

export default function FAQBlock({ productId }: FAQBlockProps) {
  const t = useTranslations('faq')
  const locale = useLocale()
  const [faq, setFaq] = useState<FAQItem[]>([])

  useEffect(() => {
    const loc = typeof locale === 'string' ? locale : 'fr'
    fetch(`/api/faq?locale=${encodeURIComponent(loc)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: Array<{ question?: string; answer?: string }>) => {
        const list = Array.isArray(data) ? data : []
        setFaq(list.map((entry) => ({ q: entry.question, a: entry.answer })))
      })
      .catch(() => setFaq([]))
  }, [locale])

  if (!faq.length) return null

  return (
    <section className="mt-6" aria-labelledby="faq-block-heading">
      <h3 id="faq-block-heading" className="text-lg font-semibold mb-2">
        {t('section_title')}
      </h3>
      <ul>
        {faq.map((item, i) => (
          <li key={item.q ?? i} className="mb-2">
            <strong>{item.q}</strong>
            <div>{item.a}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
