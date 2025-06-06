// src/app/[locale]/page.js
'use client';

import SEOHead from '@/components/SEOHead';
import HomeClient from '@/components/HomeClient';

export default function LocaleHomePage() {
  return (
    <>
      <SEOHead
        titleKey="homepage_title"
        descriptionKey="homepage_description"
      />
      <HomeClient />
    </>
  );
}
