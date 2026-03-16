'use client';

import { useTranslations } from 'next-intl';

type Props = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
};

export default function ErrorWithRetry({ message, onRetry, retryLabel, className = '' }: Props) {
  const t = useTranslations('common');
  const label = retryLabel ?? t('retry');

  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50/80 p-3.5 dark:border-red-900/50 dark:bg-red-950/30 ${className}`}
      role="alert"
    >
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline dark:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
        aria-label={label}
      >
        {label}
      </button>
    </div>
  );
}
