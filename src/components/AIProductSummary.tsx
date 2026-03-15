'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface ProductSummaryInput {
  title?: string;
  description?: string;
}

interface AIProductSummaryProps {
  product: ProductSummaryInput | null | undefined;
}

export default function AIProductSummary({ product }: AIProductSummaryProps) {
  const t = useTranslations('common')
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product?.description) return;

    setLoading(true);
    setError(null);

    fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.summary) {
          setSummary(data.summary)
        } else {
          setError(t('ai_summary_unavailable'))
        }
      })
      .catch(() => setError(t('ai_summary_error')))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- t is stable, product is the trigger
  }, [product])

  if (loading) {
    return <p className="text-sm italic text-token-text/60 animate-pulse">{t('ai_summary_loading')}</p>
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  if (!summary) return null

  return (
    <div className="mt-3 p-3 rounded bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--text))] text-sm shadow-[var(--shadow-sm)]">
      <strong>{t('ai_summary_label')}</strong> {summary}
    </div>
  )
}
