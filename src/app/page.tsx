// src/app/page.tsx — Home i18n-ready (FR/EN via cookie), catégories localisées, SEO centralisé
import type { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'

import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Product, Pack } from '@/types/product'
import TrustBadges from '@/components/TrustBadges'
import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import { generateMeta } from '@/lib/seo'
import { getCategories } from '@/lib/categories'
import { isLocale, defaultLocale as DEFAULT_LOCALE } from '@/i18n/config'

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'))
const BestProducts = dynamic(() => import('@/components/BestProducts'), {
  loading: () => <SectionSkeleton title="…" />,
})
const PacksSection = dynamic(() => import('@/components/PacksSection'), {
  loading: () => <SectionSkeleton title="…" />,
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <SectionSkeleton title="…" />,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'

/* ----------------------------- i18n strings ------------------------------ */
const STR = {
  fr: {
    homeTitle: 'TechPlay – Boutique high-tech & packs exclusifs',
    heroAria: 'Carrousel des produits en vedette',
    catsKicker: 'Explorer',
    catsTitle: 'Catégories incontournables',
    catsSub: 'Des sélections pointues pour aller droit au but.',
    bestKicker: 'Top ventes',
    bestTitle: 'Nos Meilleures Ventes',
    bestSub: 'Les favoris de la communauté – stock limité.',
    packsKicker: 'Bundle',
    packsTitle: 'Packs recommandés',
    packsSub: 'Des combinaisons pensées pour la performance et l’économie.',
    faqTitle: 'Questions fréquentes',
    ctaTitle: 'Appel à l’action',
    ctaOffer: 'Offre du moment',
    ctaHeadline: 'Boostez votre setup en ',
    ctaSpan: 'un clic',
    ctaText: 'Packs optimisés, meilleurs prix, livraison rapide.',
    ctaPacks: 'Découvrir les packs',
    ctaProducts: 'Voir les produits',
    seeCat: 'Voir →',
  },
  en: {
    homeTitle: 'TechPlay – High-tech store & exclusive bundles',
    heroAria: 'Featured products carousel',
    catsKicker: 'Explore',
    catsTitle: 'Must-have categories',
    catsSub: 'Curated picks to get straight to the point.',
    bestKicker: 'Best sellers',
    bestTitle: 'Our Best Sellers',
    bestSub: 'Community favorites – limited stock.',
    packsKicker: 'Bundle',
    packsTitle: 'Recommended bundles',
    packsSub: 'Combos designed for performance and savings.',
    faqTitle: 'Frequently asked questions',
    ctaTitle: 'Call to action',
    ctaOffer: 'Deal of the moment',
    ctaHeadline: 'Boost your setup in ',
    ctaSpan: 'one click',
    ctaText: 'Optimized bundles, best prices, fast delivery.',
    ctaPacks: 'Discover bundles',
    ctaProducts: 'View products',
    seeCat: 'See →',
  },
} as const

// SEO: on génère tout via lib/seo puis on force un titre absolute (évite le suffixe du layout)
const BASE_META = generateMeta({
  title: 'TechPlay – Boutique high-tech & packs exclusifs',
  description:
    'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation. Casques, souris, claviers, et accessoires gaming de qualité supérieure.',
  url: '/',
  image: '/og-image.jpg',
  type: 'website',
  locale: 'fr_FR',
})
export const metadata: Metadata = {
  ...BASE_META,
  title: { absolute: 'TechPlay – Boutique high-tech & packs exclusifs' },
}

// ISR revalidation
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
function FeaturedCategories({ locale }: { locale: 'fr' | 'en' }) {
  const items = getCategories(locale).slice(0, 8)

  return (
    <section id="categories" aria-labelledby="cats-title" className="motion-section">
      <SectionHeader
        kicker={STR[locale].catsKicker}
        title={STR[locale].catsTitle}
        sub={STR[locale].catsSub}
      />
      <h3 id="cats-title" className="sr-only">{STR[locale].catsTitle}</h3>

      <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {items.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              prefetch={false}
              className="group block rounded-2xl border border-token-border bg-token-surface/70 backdrop-blur shadow-sm transition hover:shadow-elevated focus-ring p-4 sm:p-5"
              data-gtm="home_cat_card"
              data-cat={c.label}
              aria-label={`${c.label} — ${c.desc}`}
            >
              <c.Icon className="opacity-80" />
              <div className="mt-3 font-semibold">{c.label}</div>
              <div className="text-xs text-token-text/60">{c.desc}</div>
              <div className="mt-3 text-xs font-semibold text-[hsl(var(--accent))] opacity-0 transition group-hover:opacity-100">
                {STR[locale].seeCat}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SplitCTA({ locale }: { locale: 'fr' | 'en' }) {
  return (
    <section
      aria-label={STR[locale].ctaTitle}
      className="motion-section relative overflow-hidden rounded-3xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-6 sm:p-10 shadow-elevated"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' } as any}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-token-text/10 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-[hsl(var(--accent))]/90">
            {STR[locale].ctaOffer}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
            {STR[locale].ctaHeadline}
            <span className="text-gradient">{STR[locale].ctaSpan}</span>
          </h3>
          <p className="mt-3 text-sm sm:text-base text-token-text/70">
            {STR[locale].ctaText}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              data-gtm="home_cta_packs"
            >
              {STR[locale].ctaPacks}
            </Link>
            <Link
              href="/products"
              prefetch={false}
              className="inline-flex items-center rounded-xl border border-token-border bg-token-surface px-5 py-3 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              data-gtm="home_cta_products"
            >
              {STR[locale].ctaProducts}
            </Link>
          </div>
        </div>
        <div className="min-h-[180px] rounded-2xl border border-token-border bg-token-surface/60 shadow-elevated" />
      </div>
    </section>
  )
}

function Testimonials({ locale }: { locale: 'fr' | 'en' }) {
  const items =
    locale === 'fr'
      ? [
          { name: 'Léa',    text: 'Livraison rapide et clavier incroyable, je recommande !' },
          { name: 'Maxime', text: 'Service client réactif, pack super rentable.' },
          { name: 'Amine',  text: 'Qualité au top, site fluide et clair.' },
        ]
      : [
          { name: 'Lea',   text: 'Fast delivery and an amazing keyboard, highly recommend!' },
          { name: 'Max',   text: 'Responsive support, bundle was great value.' },
          { name: 'Amin',  text: 'Top quality, smooth and clear website.' },
        ]

  return (
    <section aria-label="Testimonials" className="motion-section">
      <SectionHeader kicker="Avis / Reviews" title="Les clients en parlent / What customers say" sub="" />
      <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map((t, i) => (
          <li key={i} className="rounded-2xl border border-token-border bg-token-surface/70 p-5 shadow-soft">
            <p className="text-sm text-token-text/90">“{t.text}”</p>
            <p className="mt-3 text-sm font-semibold">— {t.name}</p>
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
  // Locale depuis cookie (fallback FR)
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = isLocale(cookieLocale || '') ? (cookieLocale as 'fr' | 'en') : (DEFAULT_LOCALE as 'fr' | 'en')
  const L = STR[locale]

  let bestProducts: Product[] = []
  let recommendedPacks: Pack[] = []
  try {
    ;[bestProducts, recommendedPacks] = await Promise.all([
      getBestProducts(),
      getRecommendedPacks(),
    ])
  } catch {
    // soft-fail : skeletons
  }

  // JSON-LD ItemList (uniquement ici ; WebSite/Organization sont dans le layout)
  const itemListJsonLd =
    Array.isArray(bestProducts) && bestProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: bestProducts.slice(0, 8).map((p: any, idx: number) => ([
            {
              '@type': 'ListItem',
              position: idx + 1,
              url: p?.slug ? `${SITE_URL}/products/${p.slug}` : `${SITE_URL}/products`,
              name: p?.title ?? 'Produit',
            }
          ][0])),
        }
      : null

  return (
    <>
      <h1 className="sr-only">{L.homeTitle}</h1>
      <ClientTrackingScript event="homepage_view" />

      {/* Glow décoratif global */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 -top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      </div>

      <main id="main" className="mx-auto max-w-screen-xl scroll-smooth px-4 sm:px-6 space-y-24 md:space-y-28" role="main" tabIndex={-1}>
        <section aria-label={L.heroAria} className="motion-section" id="hero">
          <Suspense fallback={<div className="h-40 sm:h-56 lg:h-72 rounded-2xl skeleton" />}>
            <HeroCarousel />
            <noscript><p><a href="/products">Voir les produits</a></p></noscript>
          </Suspense>
        </section>

        <FeaturedCategories locale={locale} />

        <section
          aria-label={L.bestTitle}
          className="motion-section"
          id="best-products"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker={L.bestKicker}
            title={L.bestTitle}
            sub={L.bestSub}
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={L.bestTitle} />}>
              <BestProducts products={bestProducts} showTitle={false} />
            </Suspense>
          </div>
        </section>

        <section
          aria-label={L.packsTitle}
          className="motion-section"
          id="packs"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker={L.packsKicker}
            title={L.packsTitle}
            sub={L.packsSub}
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={L.packsTitle} />}>
              <PacksSection packs={recommendedPacks} />
            </Suspense>
          </div>
        </section>

        <Testimonials locale={locale} />
        <SplitCTA locale={locale} />

        <section
          aria-label={L.faqTitle}
          className="motion-section"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' } as any}
        >
          <SectionHeader kicker="FAQ" title={L.faqTitle} />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={L.faqTitle} />}>
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
