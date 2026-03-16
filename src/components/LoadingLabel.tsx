'use client';

import { useTranslations } from 'next-intl';

/** Fallback de chargement traduit pour lazy/dynamic. */
export default function LoadingLabel() {
  const t = useTranslations('common');
  return <p>{t('loading')}</p>;
}
