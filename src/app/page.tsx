// src/app/page.tsx — Home ULTIME++ (perf/a11y/SEO centralisé, i18n server) — PATCH
import type { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Product, Pack } from '@/types/product'
import TrustBadges from '@/components/TrustBadges'
import Link from '@/components/LocalizedLink'
import { generateMeta } from '@/lib/seo'
import { CATEGORIES } from '@/lib/categories'

// ⛑️ IMPORTANT: tout ce qui peut toucher window/DOM devient client-only
const ClientTrackingScript = dynamic(() => import('@/components/ClientTrackingScript'), { ssr: false })
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  ssr: false,
  loading: () => <div className="h-40 sm:h-56 lg:h-72 rounded-2xl skeleton" />,
})
const BestProducts = dynamic(() => import('@/components/BestProducts'), {
  ssr: false,
  loading: () => <SectionSkeleton title="…" />,
})
const PacksSection = dynamic(() => import('@/components/PacksSection'), {
  ssr: false,
  loading: () => <SectionSkeleton title="…" />,
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  ssr: false,
  loading: () => <SectionSkeleton title="…" />,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'

// SEO localisé via next-intl (messages.seo.*) + fallback si jamais le namespace manque
export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await getTranslations('seo')
    const BASE = generateMeta({
      title: t('homepage_title'),
      description: t('homepage_description'),
      url: '/',
      image: '/og-image.jpg',
      type: 'website',
    })
    return {
      ...BASE,
      title: { absolute: t('homepage_title') },
      description: t('homepage_description'),
    }
  } catch {
    return generateMeta({
      title: 'TechPlay – Boutique high-tech innovante',
      description:
        'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
      url: '/',
      image: '/og-image.jpg',
      type: 'website',
    })
  }
}

// ISR
export const revalidate = 300

/* -------------------------- UI helpers (section) -------------------------- */
function SectionHeader({
  kicker, title, sub, center = true, as = 'h2',
}: {
  kicker?: string; title: string; sub?: string; center?: boolean; as?: 'h2' | 'h3'
}) {
  const Tag = as
  return (
    <header className={center ? 'text-center max-w-3xl mx-auto' : ''}>
      {kicker && (
        <p className="text-xs tracking-widest uppercase font-bold text-[hsl(var(--accent))]/90">
          {kicker}
        </p>
      )}
      <Tag className="mt-2 text-balance font-extrabold tracking-tight text-[clamp(1.75rem,3vw+1rem,2.5rem)]">
        <span className="text-gradient">{title}</span>
      </Tag>
      {sub && <p className="mt-3 text-sm sm:text-base text-token-text/70">{sub}</p>}
    </header>
  )
}

/* --------------------- Catégories (icônes premium centrales) -------------------- */
async function FeaturedCategories() {
  const t = await getTranslations('home.sections')
  const items = CATEGORIES.slice(0, 8)

  return (
    <section id="categories" aria-labelledby="cats-title" className="motion-section">
      <SectionHeader
        kicker={t('explore')}
        title={t('categories_title')}
        sub={t('categories_sub')}
      />
      <h3 id="cats-title" className="sr-only">{t('categories_aria')}</h3>

      <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {items.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              prefetch={false}
              className="group block rounded-2xl border border-token-border bg-token-surface/70 backdrop-blur shadow-sm transition hover:shadow-elevated focus-ring p-4 sm:p-5"
              data-gtm="home_cat_card"
              data-cat={c.label}
              aria-label={`${t('see_category')} ${c.label} — ${c.desc}`}
            >
              <c.Icon className="opacity-80" />
              <div className="mt-3 font-semibold">{c.label}</div>
              <div className="text-xs text-token-text/60">{c.desc}</div>
              <div className="mt-3 text-xs font-semibold text-[hsl(var(--accent))] opacity-0 transition group-hover:opacity-100">
                {t('see')}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

async function SplitCTA() {
  const t = await getTranslations('home.cta')
  return (
    <section
      aria-label={t('aria')}
      className="motion-section relative overflow-hidden rounded-3xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-6 sm:p-10 shadow-elevated"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' } as any}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-token-text/10 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-[hsl(var(--accent))]/90">{t('kicker')}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
            {t('headline_prefix')} <span className="text-gradient">{t('headline_accent')}</span>
          </h3>
          <p className="mt-3 text-sm sm:text-base text-token-text/70">{t('sub')}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              data-gtm="home_cta_packs"
            >
              {t('see_packs')}
            </Link>
            <Link
              href="/products"
              prefetch={false}
              className="inline-flex items-center rounded-xl border border-token-border bg-token-surface px-5 py-3 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              data-gtm="home_cta_products"
            >
              {t('see_products')}
            </Link>
          </div>
        </div>
        <div className="min-h-[180px] rounded-2xl border border-token-border bg-token-surface/60 shadow-elevated" />
      </div>
    </section>
  )
}

async function Testimonials() {
  const t = await getTranslations('home.testimonials')
  const items = [
    { name: 'Léa',    text: t('lea') },
    { name: 'Maxime', text: t('maxime') },
    { name: 'Amine',  text: t('amine') },
  ]
  return (
    <section aria-label={t('aria')} className="motion-section">
      <SectionHeader kicker={t('kicker')} title={t('title')} sub={t('sub')} />
      <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map((it, i) => (
          <li key={i} className="rounded-2xl border border-token-border bg-token-surface/70 p-5 shadow-soft">
            <p className="text-sm text-token-text/90">“{it.text}”</p>
            <p className="mt-3 text-sm font-semibold">— {it.name}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="motion-section">
      <SectionHeader title={title} />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    </section>
  )
}

/* --------------------------------- Page ---------------------------------- */
export default async function HomePage() {
  const tHome = await getTranslations('home.sections')

  let bestProducts: Product[] = []
  let recommendedPacks: Pack[] = []
  try {
    ;[bestProducts, recommendedPacks] = await Promise.all([getBestProducts(), getRecommendedPacks()])
  } catch {
    // soft-fail : skeletons
    bestProducts = []
    recommendedPacks = []
  }

  // JSON-LD ItemList (uniquement ici ; WebSite/Organization sont dans le layout)
  const itemListJsonLd =
    Array.isArray(bestProducts) && bestProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: bestProducts.slice(0, 8).map((p: any, idx: number) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: p?.slug ? `${SITE_URL}/products/${p.slug}` : `${SITE_URL}/products`,
            name: p?.title ?? 'Produit',
          })),
        }
      : null

  return (
    <>
      <h1 className="sr-only">{tHome('home_h1')}</h1>
      <ClientTrackingScript event="homepage_view" />

      {/* Glow décoratif global */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 -top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      </div>

      <main id="main" className="mx-auto max-w-screen-xl scroll-smooth px-4 sm:px-6 space-y-24 md:space-y-28" role="main" tabIndex={-1}>
        <section aria-label={tHome('hero_aria')} className="motion-section" id="hero">
          <Suspense fallback={<div className="h-40 sm:h-56 lg:h-72 rounded-2xl skeleton" />}>
            <HeroCarousel />
            <noscript><p><a href="/products">{tHome('see_products_noscript')}</a></p></noscript>
          </Suspense>
        </section>

        {/* Catégories */}
        <FeaturedCategories />

        {/* Meilleures ventes */}
        <section
          aria-label={tHome('best_aria')}
          className="motion-section"
          id="best-products"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker={tHome('best_kicker')}
            title={tHome('best_title')}
            sub={tHome('best_sub')}
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={tHome('best_title')} />}>
              <BestProducts products={bestProducts} showTitle={false} />
            </Suspense>
          </div>
        </section>

        {/* Packs */}
        <section
          aria-label={tHome('packs_aria')}
          className="motion-section"
          id="packs"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker={tHome('packs_kicker')}
            title={tHome('packs_title')}
            sub={tHome('packs_sub')}
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={tHome('packs_title')} />}>
              <PacksSection packs={recommendedPacks} />
            </Suspense>
          </div>
        </section>

        <Testimonials />
        <SplitCTA />

        {/* FAQ */}
        <section
          aria-label={tHome('faq_aria')}
          className="motion-section"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' } as any}
        >
          <SectionHeader kicker="FAQ" title={tHome('faq_title')} />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={tHome('faq_title')} />}>
              <FAQ />
            </Suspense>
          </div>
        </section>

        <TrustBadges variant="premium" className="mt-10" />
      </main>

      {itemListJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      ) : null}
    </>
  )
}
