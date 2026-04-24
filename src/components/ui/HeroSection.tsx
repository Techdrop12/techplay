'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  return (
    <div className="relative text-white text-center py-20 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/hero-bg.jpg"
          fill
          alt="Arrière-plan hero TechPlay"
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-lg md:text-xl">{t('subtitle')}</p>
      </div>
    </div>
  );
}
