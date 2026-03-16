'use client';

import { useTranslations } from 'next-intl';

import SectionHeader from '@/components/SectionHeader';

export default function LoadingSectionSkeleton() {
  const t = useTranslations('common');
  return (
    <section className="motion-section" aria-busy="true" aria-live="polite">
      <SectionHeader title={t('loading')} />
      <div className="rhythm-content grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-2xl" aria-hidden />
        ))}
      </div>
    </section>
  );
}
