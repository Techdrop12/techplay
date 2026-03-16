'use client';

import { useTranslations } from 'next-intl';

interface ErrorProps {
  message: React.ReactNode;
}

export default function Error({ message }: ErrorProps) {
  const t = useTranslations('common');
  return (
    <div className="error">
      {t('error_label')}: {message}
    </div>
  );
}
