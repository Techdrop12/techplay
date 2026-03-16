'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const t = useTranslations('offline');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-3 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white shadow-md"
      aria-live="polite"
    >
      <span aria-hidden className="text-base">
        📡
      </span>
      <span>{t('message')}</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded bg-white/20 px-2 py-1 text-xs font-semibold hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {t('retry')}
      </button>
    </div>
  );
}
