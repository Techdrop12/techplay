'use client'

import { useTranslations } from 'next-intl'
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
  const [faq, setFaq] = useState<FAQItem[]>([])

  useEffect(() => {
    if (!productId) return
    fetch(`/api/faq/${productId}`)
      .then((res) => res.json())
      .then((data: { faq?: FAQItem[] }) => setFaq(Array.isArray(data?.faq) ? data.faq : []))
  }, [productId])

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
