// File: src/app/[locale]/admin/generate-blog/page.js
'use client';

import { useTranslations } from 'next-intl';
import SEOHead from '@/components/SEOHead';
import GenerateBlogPost from '@/components/GenerateBlogPost';

export default function GenerateBlogAdminPage() {
  const t = useTranslations('admin');

  return (
    <>
      <SEOHead
        overrideTitle={t('dashboard')}
        overrideDescription="Générateur IA de nouveaux articles"
      />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧠 Générateur d’articles IA</h1>
        <GenerateBlogPost />
      </div>
    </>
  );
}
