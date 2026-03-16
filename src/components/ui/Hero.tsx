'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from '@/components/LocalizedLink';

export default function Hero() {
  const t = useTranslations('hero');
  const tConsent = useTranslations('consent');
  return (
    <section className="relative bg-[hsl(var(--surface-2))]">
      <div className="max-w-7xl mx-auto py-20 px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[hsl(var(--text))]">
            Boostez votre quotidien avec <span className="text-[hsl(var(--accent))]">TechPlay</span>
          </h1>
          <p className="mt-4 text-lg text-token-text/75">
            Gadgets, accessoires et innovations tech – livraison rapide, SAV premium.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/products"
              className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-6 py-3 rounded-xl shadow-[var(--shadow-sm)] hover:opacity-95"
            >
              {t('cta_new')}
            </Link>
            <Link
              href="/contact"
              className="border border-[hsl(var(--border))] px-6 py-3 rounded-xl hover:bg-[hsl(var(--surface))]"
            >
              {tConsent('learn_more')}
            </Link>
          </div>
        </div>
        <div className="flex-1 relative w-full h-64 md:h-96">
          <Image
            src="/hero-tech.webp"
            alt="TechPlay Hero"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
