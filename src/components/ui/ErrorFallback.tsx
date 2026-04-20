'use client';

import { useTranslations } from 'next-intl';

interface ErrorFallbackProps {
  error: Error | unknown;
}

export default function ErrorFallback({ error }: ErrorFallbackProps) {
  const t = useTranslations('error');
  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorFallback]', error);
  }
  return (
    <div role="alert" className="rounded border border-red-300 bg-red-100 p-4 text-red-700">
      <p>{t('fallback_message')}</p>
    </div>
  );
}
