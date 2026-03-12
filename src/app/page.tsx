// src/app/page.tsx
import dynamic from 'next/dynamic'
import { Suspense, type CSSProperties } from 'react'

import type { Pack, Product } from '@/types/product'
import type { Metadata } from 'next'

import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import TrustBadges from '@/components/TrustBadges'
import { getCategories } from '@/lib/categories'
import { getBestProducts, getRecommendedPacks } from '@/lib/data'

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

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(
  /\/+$/,
  ''
)

const lazySectionStyle600: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '600px',
}

const lazySectionStyle500: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '500px',
}

const lazySectionStyle300: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '300px',
}

const STR = {
  fr: {
    metaTitle: 'TechPlay – Boutique high-tech & packs exclusifs',
    metaDescription:
      'Découvrez les meilleures offres TechPlay : accessoires high-tech, gaming, audio et packs exclusifs sélectionnés pour la performance, le style et la fiabilité.',
    heroAria: 'Carrousel des produits en vedette',
    catsKicker: 'Explorer',
    catsTitle: 'Catégories incontournables',
    catsSub: 'Des sélections ciblées pour trouver vite le bon setup.',
    bestKicker: 'Top ventes',
    bestTitle: 'Nos meilleures ventes',
    bestSub: 'Les favoris de la communauté, choisis pour leur fiabilité et leur impact.',
    packsKicker: 'Bundles',
    packsTitle: 'Packs recommandés',
    packsSub: 'Des combinaisons pensées pour le meilleur rapport performance / budget.',
    faqTitle: 'Questions fréquentes',
    faqKicker: 'FAQ',
    ctaTitle: 'Appel à l’action',
    ctaOffer: 'Offre du moment',
    ctaHeadline: 'Boostez votre setup en ',
    ctaSpan: 'un clic',
    ctaText: 'Packs optimisés, meilleurs prix, livraison rapide et expérience premium.',
    ctaPacks: 'Découvrir les packs',
    ctaProducts: 'Voir les produits',
    seeCat: 'Voir →',
    testimonialsTitle: 'Les clients en parlent',
    testimonialsKicker: 'Avis',
    testimonialsSub: 'Des retours concrets sur l’expérience TechPlay.',
    noscriptProducts: 'Voir les produits',
    productsSectionLabel: 'Sélection de produits populaires',
    packsSectionLabel: 'Sélection de packs recommandés',
  },
  en: {
    metaTitle: 'TechPlay – High-tech store & exclusive bundles',
    metaDescription:
      'Discover the best TechPlay offers: high-tech accessories, gaming, audio gear and exclusive bundles selected for performance, style and reliability.',
    heroAria: 'Featured products carousel',
    catsKicker: 'Explore',
    catsTitle: 'Must-have categories',
    catsSub: 'Curated selections to find the right setup faster.',
    bestKicker: 'Best sellers',
    bestTitle: 'Our best sellers',
    bestSub: 'Community favorites selected for reliability and real value.',
    packsKicker: 'Bundles',
    packsTitle: 'Recommended bundles',
    packsSub: 'Smart combinations designed for performance and savings.',
    faqTitle: 'Frequently asked questions',
    faqKicker: 'FAQ',
    ctaTitle: 'Call to action',
    ctaOffer: 'Deal of the moment',
    ctaHeadline: 'Boost your setup in ',
    ctaSpan: 'one click',
    ctaText: 'Optimized bundles, better prices, fast delivery and a premium experience.',
    ctaPacks: 'Discover bundles',
    ctaProducts: 'View products',
    seeCat: 'See →',
    testimonialsTitle: 'What customers say',
    testimonialsKicker: 'Reviews',
    testimonialsSub: 'Real feedback about the TechPlay experience.',
    noscriptProducts: 'View products',
    productsSectionLabel: 'Popular products selection',
    packsSectionLabel: 'Recommended bundles selection',
  },
} as const

export type HomeLocale = keyof typeof STR
export const revalidate = 300

export function buildHomeMetadata(locale: HomeLocale): Metadata {
  const t = STR[locale]
  const canonical = locale === 'en' ? '/en' : '/'

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical,
      languages: {
        fr: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: t.metaTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
      images: ['/og-image.jpg'],
    },
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata('fr')
}

function getProductUrl(product: Product): string {
  return product.slug ? `${SITE_URL}/products/${product.slug}` : `${SITE_URL}/products`
}

function getProductName(product: Product): string {
  return product.title?.trim() || 'Produit'
}

function SectionHeader({
  kicker,
  title,
  sub,
  center = true,
  as = 'h2',
}: {
  kicker?: string
  title: string
  sub?: string
  center?: boolean
  as?: 'h2' | 'h3'
}) {
  const Tag = as

  return (
    <header className={center ? 'mx-auto max-w-3xl text-center' : ''}>
      {kicker ? (
        <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent))]/90">
          {kicker}
        </p>
      ) : null}

      <Tag className="mt-2 text-balance font-extrabold tracking-tight text-[clamp(1.75rem,3vw+1rem,2.5rem)]">
        <span className="text-gradient">{title}</span>
      </Tag>

      {sub ? <p className="mt-3 text-sm text-token-text/70 sm:text-base">{sub}</p> : null}
    </header>
  )
}

function FeaturedCategories({ locale }: { locale: HomeLocale }) {
  const items = getCategories(locale).slice(0, 8)
  const t = STR[locale]

  return (
    <section id="categories" aria-labelledby="cats-title" className="motion-section">
      <SectionHeader kicker={t.catsKicker} title={t.catsTitle} sub={t.catsSub} />

      <h2 id="cats-title" className="sr-only">
        {t.catsTitle}
      </h2>

      <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {items.map((category) => (
          <li key={category.href}>
            <Link
              href={category.href}
              prefetch={false}
              className="group block rounded-2xl border border-token-border bg-token-surface/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-elevated focus-ring sm:p-5"
              data-gtm="home_cat_card"
              data-cat={category.label}
              aria-label={`${category.label} — ${category.desc}`}
            >
              <category.Icon className="opacity-80 transition group-hover:opacity-100" />
              <div className="mt-3 font-semibold">{category.label}</div>
              <div className="text-xs text-token-text/60">{category.desc}</div>
              <div className="mt-3 text-xs font-semibold text-[hsl(var(--accent))] opacity-0 transition group-hover:opacity-100">
                {t.seeCat}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SplitCTA({ locale }: { locale: HomeLocale }) {
  const t = STR[locale]

  return (
    <section
      aria-label={t.ctaTitle}
      className="motion-section relative overflow-hidden rounded-3xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-6 shadow-elevated sm:p-10"
      style={lazySectionStyle300}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-token-text/10 blur-3xl"
      />

      <div className="relative grid items-center gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent))]/90">
            {t.ctaOffer}
          </p>

          <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {t.ctaHeadline}
            <span className="text-gradient">{t.ctaSpan}</span>
          </h3>

          <p className="mt-3 text-sm text-token-text/70 sm:text-base">{t.ctaText}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              data-gtm="home_cta_packs"
            >
              {t.ctaPacks}
            </Link>

            <Link
              href="/products"
              prefetch={false}
              className="inline-flex items-center rounded-xl border border-token-border bg-token-surface px-5 py-3 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              data-gtm="home_cta_products"
            >
              {t.ctaProducts}
            </Link>
          </div>
        </div>

        <div className="min-h-[180px] rounded-2xl border border-token-border bg-token-surface/60 shadow-elevated" />
      </div>
    </section>
  )
}

function Testimonials({ locale }: { locale: HomeLocale }) {
  const t = STR[locale]

  const items =
    locale === 'fr'
      ? [
          {
            name: 'Léa',
            text: 'Livraison rapide, produit conforme et vraie sensation premium dès l’ouverture.',
          },
          {
            name: 'Maxime',
            text: 'Site clair, excellent pack et commande reçue sans mauvaise surprise.',
          },
          {
            name: 'Amine',
            text: 'Très bon rapport qualité/prix et expérience plus propre que beaucoup de boutiques.',
          },
        ]
      : [
          {
            name: 'Lea',
            text: 'Fast delivery, great product and a genuinely premium unboxing experience.',
          },
          {
            name: 'Max',
            text: 'Clear website, excellent bundle and no unpleasant surprises after ordering.',
          },
          {
            name: 'Amin',
            text: 'Great value for money and a cleaner experience than many other stores.',
          },
        ]

  return (
    <section aria-label={t.testimonialsTitle} className="motion-section">
      <SectionHeader
        kicker={t.testimonialsKicker}
        title={t.testimonialsTitle}
        sub={t.testimonialsSub}
      />

      <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="rounded-2xl border border-token-border bg-token-surface/70 p-5 shadow-soft"
          >
            <p className="text-sm text-token-text/90">“{item.text}”</p>
            <p className="mt-3 text-sm font-semibold">— {item.name}</p>
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
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    </section>
  )
}

export async function HomePageView({ locale }: { locale: HomeLocale }) {
  const t = STR[locale]

  const [bestProductsResult, recommendedPacksResult] = await Promise.allSettled([
    getBestProducts(),
    getRecommendedPacks(),
  ])

  const bestProducts: Product[] =
    bestProductsResult.status === 'fulfilled' ? bestProductsResult.value : []

  const recommendedPacks: Pack[] =
    recommendedPacksResult.status === 'fulfilled' ? recommendedPacksResult.value : []

  const itemListJsonLd =
    bestProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t.bestTitle,
          itemListElement: bestProducts.slice(0, 8).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: getProductUrl(product),
            name: getProductName(product),
          })),
        }
      : null

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.metaTitle,
    description: t.metaDescription,
    url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
    inLanguage: locale === 'en' ? 'en-US' : 'fr-FR',
  }

  return (
    <>
      <h1 className="sr-only">{t.metaTitle}</h1>
      <ClientTrackingScript event="homepage_view" />

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 -top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      </div>

      <main
        id="main"
        role="main"
        tabIndex={-1}
        className="mx-auto max-w-screen-xl scroll-smooth space-y-24 px-4 sm:px-6 md:space-y-28"
      >
        <section aria-label={t.heroAria} className="motion-section" id="hero">
          <Suspense fallback={<div className="skeleton h-40 rounded-2xl sm:h-56 lg:h-72" />}>
            <HeroCarousel />
            <noscript>
              <p>
                <a href="/products">{t.noscriptProducts}</a>
              </p>
            </noscript>
          </Suspense>
        </section>

        <FeaturedCategories locale={locale} />

        <section
          id="best-products"
          aria-label={t.productsSectionLabel}
          className="motion-section"
          style={lazySectionStyle600}
        >
          <SectionHeader kicker={t.bestKicker} title={t.bestTitle} sub={t.bestSub} />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={t.bestTitle} />}>
              <BestProducts products={bestProducts} showTitle={false} />
            </Suspense>
          </div>
        </section>

        <section
          id="packs"
          aria-label={t.packsSectionLabel}
          className="motion-section"
          style={lazySectionStyle600}
        >
          <SectionHeader kicker={t.packsKicker} title={t.packsTitle} sub={t.packsSub} />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={t.packsTitle} />}>
              <PacksSection packs={recommendedPacks} />
            </Suspense>
          </div>
        </section>

        <Testimonials locale={locale} />
        <SplitCTA locale={locale} />

        <section
          id="faq"
          aria-label={t.faqTitle}
          className="motion-section"
          style={lazySectionStyle500}
        >
          <SectionHeader kicker={t.faqKicker} title={t.faqTitle} />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title={t.faqTitle} />}>
              <FAQ />
            </Suspense>
          </div>
        </section>

        <TrustBadges variant="premium" className="mt-10" />
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
    </>
  )
}

export default async function HomePage() {
  return <HomePageView locale="fr" />
}