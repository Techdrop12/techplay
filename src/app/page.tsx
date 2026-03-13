import dynamic from 'next/dynamic'
import { Suspense, type CSSProperties } from 'react'

import type { Pack, Product } from '@/types/product'
import type { Metadata } from 'next'

import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import TrustBadges from '@/components/TrustBadges'
import { getCategories } from '@/lib/categories'
import { BRAND } from '@/lib/constants'
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


const SITE_URL = BRAND.URL

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
    heroBadge: 'Nouvelle collection',
    heroTitle: 'Un setup haut de gamme, sans compromis.',
    heroSubtitle:
      'Des accessoires et packs pensés pour la performance, la fiabilité et une esthétique premium — de la sélection au déballage.',
    heroPrimaryCta: 'Découvrir les packs',
    heroSecondaryCta: 'Voir tous les produits',
    heroMeta: 'Livraison 48–72 h · Paiement sécurisé · Retours 30 j',
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
    heroBadge: 'New collection',
    heroTitle: 'A high-end setup, no compromises.',
    heroSubtitle:
      'Accessories and bundles curated for performance, reliability and a premium feel — from selection to unboxing.',
    heroPrimaryCta: 'Discover bundles',
    heroSecondaryCta: 'View all products',
    heroMeta: '48–72 h delivery · Secure payment · 30-day returns',
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
        <p className="text-[var(--step-subtitle)] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
          {kicker}
        </p>
      ) : null}

      <Tag className="mt-4 text-balance font-bold tracking-tight text-gray-900 dark:text-white [font-size:var(--step-4)] sm:[font-size:var(--step-5)] [letter-spacing:var(--heading-tracking)]">
        {title}
      </Tag>

      {sub ? (
        <p className="mt-5 max-w-2xl text-[var(--step-0)] leading-relaxed text-token-text/75 [margin-inline:auto]">
          {sub}
        </p>
      ) : null}
    </header>
  )
}

function FeaturedCategories({ locale }: { locale: HomeLocale }) {
  const items = getCategories(locale).slice(0, 8)
  const t = STR[locale]

  return (
    <section id="categories" aria-labelledby="cats-title" className="motion-section section-spacing-sm">
      <SectionHeader kicker={t.catsKicker} title={t.catsTitle} sub={t.catsSub} />

      <h2 id="cats-title" className="sr-only">
        {t.catsTitle}
      </h2>

      <ul role="list" className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6 stagger-children">
        {items.map((category) => (
          <li key={category.href}>
            <Link
              href={category.href}
              prefetch={false}
              className="group card card-interactive block rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm backdrop-blur focus-ring sm:p-7"
              data-gtm="home_cat_card"
              data-cat={category.label}
              aria-label={`${category.label} — ${category.desc}`}
            >
              <category.Icon className="text-[hsl(var(--accent))] opacity-90 transition group-hover:opacity-100 group-hover:scale-105" />
              <div className="mt-4 font-semibold text-token-text">{category.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-token-text/60">{category.desc}</div>
              <span className="mt-4 inline-block text-xs font-semibold text-[hsl(var(--accent))] opacity-0 transition group-hover:opacity-100">
                {t.seeCat}
              </span>
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
      className="motion-section section-spacing-sm relative overflow-hidden rounded-[var(--radius-3xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-10 shadow-sm sm:p-16 md:p-20"
      style={lazySectionStyle300}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--accent)/.06)] blur-3xl"
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[var(--step-subtitle)] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            {t.ctaOffer}
          </p>

          <h3 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-[2.5rem]">
            {t.ctaHeadline}
            <span className="text-[hsl(var(--accent))]">{t.ctaSpan}</span>
          </h3>

          <p className="mt-5 max-w-lg text-[var(--step-0)] leading-relaxed text-token-text/75">
            {t.ctaText}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products/packs"
              prefetch={false}
              className="btn btn-premium btn-lg inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[var(--step-0)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]"
              data-gtm="home_cta_packs"
            >
              {t.ctaPacks}
            </Link>

            <Link
              href="/products"
              prefetch={false}
              className="btn btn-outline btn-lg inline-flex items-center gap-2 rounded-full border-[hsl(var(--border))] px-8 py-3.5 text-[var(--step-0)] hover:bg-[hsl(var(--surface-2))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]"
              data-gtm="home_cta_products"
            >
              {t.ctaProducts}
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="min-h-[220px] rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50 sm:min-h-[280px]"
        />
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
    <section aria-label={t.testimonialsTitle} className="motion-section section-spacing-sm">
      <SectionHeader
        kicker={t.testimonialsKicker}
        title={t.testimonialsTitle}
        sub={t.testimonialsSub}
      />

      <ul role="list" className="mt-14 grid gap-6 sm:grid-cols-3 stagger-children">
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="card card-hover relative overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 shadow-sm sm:p-10"
          >
            <span aria-hidden className="absolute right-4 top-4 text-4xl font-serif leading-none text-[hsl(var(--accent)/.15)] select-none sm:right-6 sm:top-6">&ldquo;</span>
            <p className="relative text-pretty text-sm leading-relaxed text-token-text/90 sm:text-base">{item.text}</p>
            <div className="mt-6 flex items-center gap-3">
              <span aria-hidden className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/.25)] to-[hsl(var(--accent)/.1)]" />
              <p className="text-sm font-semibold text-token-text">{item.name}</p>
            </div>
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

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh" />
      <div aria-hidden className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-[999px] bg-[hsl(var(--accent)/.22)] blur-3xl" />

      <main
        id="main"
        role="main"
        tabIndex={-1}
        className="container-app mx-auto max-w-screen-xl scroll-smooth space-y-[var(--section-gap)] py-4 sm:py-6"
      >
        <section
          id="hero"
          aria-label={t.heroAria}
          className="motion-section relative overflow-hidden rounded-[var(--radius-3xl)] bg-[length:100%_100%]"
          style={{ backgroundImage: 'var(--gradient-hero)' }}
        >
          <div className="container-app relative z-10 grid gap-12 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
            <div className="space-y-7 sm:space-y-8">
              <span className="text-[var(--step-subtitle)] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
                {t.heroBadge}
              </span>

              <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-[2.75rem] [line-height:var(--heading-leading)]">
                {t.heroTitle}
              </h2>

              <p className="max-w-xl text-[var(--step-0)] leading-relaxed text-token-text/75">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products/packs"
                  prefetch={false}
                  className="btn btn-premium btn-lg inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[var(--step-0)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]"
                  data-gtm="home_hero_primary"
                >
                  {t.heroPrimaryCta}
                </Link>

                <Link
                  href="/products"
                  prefetch={false}
                  className="btn btn-outline btn-lg inline-flex items-center gap-2 rounded-full border-[hsl(var(--border))] px-8 py-3.5 text-[var(--step-0)] hover:bg-[hsl(var(--surface-2))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]"
                  data-gtm="home_hero_secondary"
                >
                  {t.heroSecondaryCta}
                </Link>
              </div>

              <p className="pt-2 text-[var(--step-subtitle)] font-medium uppercase tracking-[0.2em] text-token-text/55">
                {t.heroMeta}
              </p>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[var(--radius-3xl)] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,hsl(var(--accent)/.08),transparent_60%)]" />

              <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-black/80 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
                <Suspense fallback={<div className="skeleton h-48 rounded-[var(--radius-2xl)] sm:h-60 lg:h-80" />}>
                  <HeroCarousel overlayOpacity={0.4} textSize="lg" />
                  <noscript>
                    <p className="px-4 py-3 text-sm text-token-text/80">
                      <a href="/products" className="underline underline-offset-4">
                        {t.noscriptProducts}
                      </a>
                    </p>
                  </noscript>
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <FeaturedCategories locale={locale} />

        <section
          id="best-products"
          aria-label={t.productsSectionLabel}
          className="motion-section section-spacing-sm"
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
          className="motion-section section-spacing-sm"
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
          className="motion-section section-spacing-sm"
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