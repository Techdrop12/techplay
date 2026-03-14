import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { Suspense, type CSSProperties } from 'react'

import type { Pack, Product } from '@/types/product'
import type { Metadata } from 'next'

import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import SectionHeader from '@/components/SectionHeader'
import TrustBadges from '@/components/TrustBadges'
import { getPosts } from '@/lib/blog'
import { BRAND } from '@/lib/constants'
import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import { isLocale } from '@/lib/language'

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'))
const BestProducts = dynamic(() => import('@/components/BestProducts'), {
  loading: () => <SectionSkeleton title="Chargement" />,
})
const PacksSection = dynamic(() => import('@/components/PacksSection'), {
  loading: () => <SectionSkeleton title="Chargement" />,
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <SectionSkeleton title="Chargement" />,
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
    heroBadge: 'TechPlay Premium',
    heroTitle: 'Le setup gaming des joueurs exigeants.',
    heroSubtitle:
      'Sélection pointue de périphériques et packs gaming haut de gamme : performances stables, design soigné et expérience clé en main pour élever votre niveau de jeu.',
    heroPrimaryCta: 'Voir les produits',
    heroSecondaryCta: 'Explorer les packs',
    catsKicker: 'Explorer',
    catsTitle: 'Catégories incontournables',
    catsSub: 'Des sélections ciblées pour trouver vite le bon setup.',
    bestKicker: 'Top ventes',
    bestTitle: 'Nos meilleures ventes',
    bestSub: 'Les favoris de la communauté, choisis pour leur fiabilité et leur impact.',
    packsKicker: 'Bundles',
    packsTitle: 'Packs recommandés',
    packsSub: 'Sélections expertes : plusieurs produits ensemble à prix pack. Économisez plus, livraison offerte.',
    faqTitle: 'Questions fréquentes',
    faqKicker: 'FAQ',
    ctaTitle: 'Appel à l’action',
    ctaOffer: 'Offre du moment',
    ctaHeadline: 'Boostez votre setup en ',
    ctaSpan: 'un clic',
    ctaText: 'Packs optimisés, meilleurs prix, livraison rapide et expérience premium.',
    ctaPacks: 'Découvrir les packs',
    ctaProducts: 'Voir les produits',
    noscriptProducts: 'Voir les produits',
    productsSectionLabel: 'Sélection de produits populaires',
    packsSectionLabel: 'Sélection de packs recommandés',
    blogKicker: 'Guides & SEO',
    blogTitle: 'Blog gaming & setup',
    blogSub: 'Meilleurs claviers 2026, guides setup, astuces FPS — pour ramener du trafic et convertir.',
    blogCta: 'Voir tout le blog',
    blogSectionLabel: 'Derniers articles du blog',
  },
  en: {
    metaTitle: 'TechPlay – High-tech store & exclusive bundles',
    metaDescription:
      'Discover the best TechPlay offers: high-tech accessories, gaming, audio gear and exclusive bundles selected for performance, style and reliability.',
    heroAria: 'Featured products carousel',
    heroBadge: 'TechPlay Premium',
    heroTitle: 'Premium gaming gear for serious players.',
    heroSubtitle:
      'Curated high-end gaming tech — headsets, mice, keyboards and complete bundles — engineered for consistent performance, refined aesthetics and tournament-ready setups.',
    heroPrimaryCta: 'View products',
    heroSecondaryCta: 'Explore Packs',
    catsKicker: 'Explore',
    catsTitle: 'Must-have categories',
    catsSub: 'Curated selections to find the right setup faster.',
    bestKicker: 'Best sellers',
    bestTitle: 'Our best sellers',
    bestSub: 'Community favorites selected for reliability and real value.',
    packsKicker: 'Bundles',
    packsTitle: 'Recommended bundles',
    packsSub: 'Expert picks: multiple products together at bundle price. Save more, free delivery.',
    faqTitle: 'Frequently asked questions',
    faqKicker: 'FAQ',
    ctaTitle: 'Call to action',
    ctaOffer: 'Deal of the moment',
    ctaHeadline: 'Boost your setup in ',
    ctaSpan: 'one click',
    ctaText: 'Optimized bundles, better prices, fast delivery and a premium experience.',
    ctaPacks: 'Discover bundles',
    ctaProducts: 'View products',
    noscriptProducts: 'View products',
    productsSectionLabel: 'Popular products selection',
    packsSectionLabel: 'Recommended bundles selection',
    blogKicker: 'Guides & SEO',
    blogTitle: 'Gaming blog & guides',
    blogSub: 'Best gaming keyboards 2026, setup guides, how to improve aim in FPS — drive Google traffic and convert.',
    blogCta: 'View all articles',
    blogSectionLabel: 'Latest blog posts',
  },
} as const

type HomeLocale = keyof typeof STR

export const revalidate = 300

function buildHomeMetadata(locale: HomeLocale): Metadata {
  const t = STR[locale]
  const pathPrefix = locale === 'en' ? '/en' : '/fr'
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: pathPrefix,
      languages: {
        fr: '/fr',
        en: '/en',
        'x-default': '/fr',
      },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `${SITE_URL}${pathPrefix}`,
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

function getProductUrl(product: Product): string {
  return product.slug ? `${SITE_URL}/products/${product.slug}` : `${SITE_URL}/products`
}

function getProductName(product: Product): string {
  return product.title?.trim() || 'Produit'
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="motion-section">
      <SectionHeader title={title} />
      <div className="rhythm-content grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    </section>
  )
}

function SplitCTA({ locale }: { locale: HomeLocale }) {
  const t = STR[locale]
  return (
    <section
      aria-label={t.ctaTitle}
      className="motion-section motion-section-delay-4 section-spacing-sm relative overflow-hidden rounded-[var(--radius-3xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm sm:px-12 sm:py-14 md:px-16 md:py-20"
      style={lazySectionStyle300}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--accent)/.06)] blur-3xl"
      />
      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="heading-kicker">{t.ctaOffer}</p>
          <h3 className="mt-4 heading-section sm:[font-size:var(--step-4)] md:text-[2.5rem]">
            {t.ctaHeadline}
            <span className="text-[hsl(var(--accent))]">{t.ctaSpan}</span>
          </h3>
          <p className="mt-5 max-w-lg text-[var(--step-0)] leading-relaxed text-token-text/75">{t.ctaText}</p>
          <div className="mt-8 flex flex-wrap gap-4">
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

async function HomePageView({ locale }: { locale: HomeLocale }) {
  const t = STR[locale]
  const [bestProductsResult, recommendedPacksResult, blogResult] = await Promise.allSettled([
    getBestProducts(),
    getRecommendedPacks(),
    getPosts({ limit: 3, sort: 'newest', publishedOnly: true }),
  ])
  const bestProducts: Product[] = bestProductsResult.status === 'fulfilled' ? bestProductsResult.value : []
  const recommendedPacks: Pack[] = recommendedPacksResult.status === 'fulfilled' ? recommendedPacksResult.value : []
  const _blogData = blogResult.status === 'fulfilled' ? blogResult.value : null

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

  const pathPrefix = locale === 'en' ? '/en' : '/fr'
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.metaTitle,
    description: t.metaDescription,
    url: `${SITE_URL}${pathPrefix}`,
    inLanguage: locale === 'en' ? 'en-US' : 'fr-FR',
  }

  return (
    <>
      <h1 className="sr-only">{t.metaTitle}</h1>
      <ClientTrackingScript event="homepage_view" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh" />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-[999px] bg-[hsl(var(--accent)/.22)] blur-3xl"
      />
      <main
        id="main"
        role="main"
        tabIndex={-1}
        className="scroll-smooth rhythm-sections py-0"
      >
        <section
          id="hero"
          aria-label={t.heroAria}
          className="motion-section relative w-full overflow-hidden rounded-b-[var(--radius-3xl)] border-0 border-b border-[hsl(var(--border))] bg-[length:120%_120%] shadow-[var(--shadow-xl)]"
          style={{ backgroundImage: 'var(--gradient-hero)' }}
        >
          <div className="container-app relative z-10 mx-auto grid max-w-screen-2xl gap-8 px-5 py-10 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14 lg:py-14">
            <div className="space-y-7 sm:space-y-8">
              <span className="animate-in inline-block text-[var(--step-subtitle)] font-bold uppercase tracking-[0.22em] text-[hsl(var(--accent))] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                {t.heroBadge}
              </span>
              <h2 className="animate-in animate-in-delay-1 heading-section text-balance max-w-xl font-extrabold leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] sm:[font-size:var(--step-5)] md:text-5xl lg:text-[2.75rem] lg:leading-tight">
                {t.heroTitle}
              </h2>
              <p className="animate-in animate-in-delay-2 max-w-lg text-base font-medium leading-relaxed text-token-text/90 sm:text-[15px]">
                {t.heroSubtitle}
              </p>
              <div className="animate-in animate-in-delay-3 flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href="/products"
                  prefetch={false}
                  className="hero-cta-primary inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[var(--step-0)] font-bold shadow-[var(--shadow-lg),0_0_24px_hsl(var(--accent)/0.25)] transition-all duration-200 hover:shadow-[var(--shadow-lg),0_0_32px_hsl(var(--accent)/0.35)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] sm:w-auto"
                  data-gtm="home_hero_primary"
                >
                  {t.heroPrimaryCta}
                </Link>
                <Link
                  href="/products/packs"
                  prefetch={false}
                  className="btn btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-6 py-3 text-[14px] font-semibold text-token-text/90 hover:border-[hsl(var(--accent)/.3)] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] sm:w-auto"
                  data-gtm="home_hero_secondary"
                >
                  {t.heroSecondaryCta}
                </Link>
              </div>
              <TrustBadges
                variant="pill"
                compact
                truncateLabels={false}
                className="!mt-8 !border-0 !bg-transparent !py-4 [&_ul]:!max-w-none [&_ul]:grid-cols-1 [&_ul]:sm:grid-cols-3 [&_ul]:gap-4"
                badges={[
                  { icon: 'truck', label: locale === 'en' ? 'Fast delivery' : 'Livraison rapide' },
                  { icon: 'shield', label: locale === 'en' ? '2-year warranty' : 'Garantie 2 ans' },
                  { icon: 'lock', label: locale === 'en' ? 'Secure payment' : 'Paiement sécurisé' },
                ]}
              />
            </div>
            <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]">
              <div className="pointer-events-none absolute -inset-4 rounded-[var(--radius-3xl)] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,hsl(var(--accent)/.12),transparent_55%)]" />
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 shadow-[var(--shadow-xl)] sm:min-h-[320px] lg:min-h-[380px]">
                <Suspense
                  fallback={
                    <div className="skeleton h-full min-h-[280px] rounded-[var(--radius-2xl)] sm:min-h-[320px] lg:min-h-[380px]" />
                  }
                >
                  <HeroCarousel overlayOpacity={0.25} />
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

        <div className="container-app mx-auto max-w-screen-xl rhythm-sections py-6 sm:py-10">
        <section
          id="best-products"
          aria-label={t.productsSectionLabel}
          className="motion-section motion-section-delay-1 section-spacing-sm"
          style={lazySectionStyle600}
        >
          <SectionHeader kicker={t.bestKicker} title={t.bestTitle} sub={t.bestSub} />
          <div className="rhythm-content">
            <Suspense fallback={<SectionSkeleton title={t.bestTitle} />}>
              <BestProducts products={bestProducts} showTitle={false} />
            </Suspense>
          </div>
        </section>
        <section
          id="packs"
          aria-label={t.packsSectionLabel}
          className="motion-section motion-section-delay-2 section-spacing-sm"
          style={lazySectionStyle600}
        >
          <SectionHeader kicker={t.packsKicker} title={t.packsTitle} sub={t.packsSub} />
          <div className="rhythm-content overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 shadow-sm">
            <Suspense fallback={<SectionSkeleton title={t.packsTitle} />}>
              <PacksSection packs={recommendedPacks} showHeader={false} />
            </Suspense>
          </div>
        </section>
        <TrustBadges variant="premium" />
        <section
          id="faq"
          aria-label={t.faqTitle}
          className="motion-section motion-section-delay-3 section-spacing-sm"
          style={lazySectionStyle500}
        >
          <SectionHeader kicker={t.faqKicker} title={t.faqTitle} />
          <div className="rhythm-content">
            <Suspense fallback={<SectionSkeleton title={t.faqTitle} />}>
              <FAQ showSectionHeading={false} />
            </Suspense>
          </div>
        </section>
        <SplitCTA locale={locale} />
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      {itemListJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      ) : null}
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return buildHomeMetadata('fr')
  return buildHomeMetadata(locale as HomeLocale)
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <HomePageView locale={locale as HomeLocale} />
}
