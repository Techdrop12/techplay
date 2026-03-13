import dynamic from 'next/dynamic'
import { Suspense, type CSSProperties } from 'react'

import type { Pack, Product } from '@/types/product'
import type { Metadata } from 'next'

import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import TrustBadges from '@/components/TrustBadges'
import { getCategories } from '@/lib/categories'
import { getPosts } from '@/lib/blog'
import { BRAND } from '@/lib/constants'
import { getBestProducts, getRecommendedPacks } from '@/lib/data'

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'))
const BlogCard = dynamic(() => import('@/components/blog/BlogCard'))
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
    heroBadge: 'TechPlay',
    heroTitle: 'Gaming Gear pour les vrais joueurs.',
    heroSubtitle:
      'Équipement gaming haute performance pour les joueurs compétitifs — casques, souris, claviers et packs au meilleur rapport qualité/prix.',
    heroPrimaryCta: 'Acheter',
    heroSecondaryCta: 'Explorer les packs',
    heroMeta: 'Livraison rapide · Garantie 2 ans · Paiement sécurisé',
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
    heroBadge: 'TechPlay',
    heroTitle: 'Gaming Gear For Real Players.',
    heroSubtitle:
      'High-performance gaming equipment for competitive players — headsets, mice, keyboards and value packs, best price/performance.',
    heroPrimaryCta: 'Shop Now',
    heroSecondaryCta: 'Explore Packs',
    heroMeta: 'Fast delivery · 2-year warranty · Secure payment',
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
    blogKicker: 'Guides & SEO',
    blogTitle: 'Gaming blog & guides',
    blogSub: 'Best gaming keyboards 2026, setup guides, how to improve aim in FPS — drive Google traffic and convert.',
    blogCta: 'View all articles',
    blogSectionLabel: 'Latest blog posts',
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

  const [bestProductsResult, recommendedPacksResult, blogResult] = await Promise.allSettled([
    getBestProducts(),
    getRecommendedPacks(),
    getPosts({ limit: 3, sort: 'newest', publishedOnly: true }),
  ])

  const bestProducts: Product[] =
    bestProductsResult.status === 'fulfilled' ? bestProductsResult.value : []

  const recommendedPacks: Pack[] =
    recommendedPacksResult.status === 'fulfilled' ? recommendedPacksResult.value : []

  const blogData = blogResult.status === 'fulfilled' ? blogResult.value : null
  const rawBlogPosts = Array.isArray(blogData?.items) ? blogData.items : []
  const blogPosts = rawBlogPosts.slice(0, 3).map((post: unknown, idx: number) => {
    const p = post && typeof post === 'object' ? (post as Record<string, unknown>) : {}
    const slug = String(p?.slug ?? '')
    const title = String(p?.title ?? 'Article')
    const description = String(p?.description ?? p?.excerpt ?? '')
    const image = String(p?.image ?? p?.coverImage ?? '/og-image.jpg')
    const createdAt = p?.publishedAt ?? p?.createdAt ?? new Date().toISOString()
    const tags = Array.isArray(p?.tags) ? p.tags : []
    return {
      _id: String(p?._id ?? p?.id ?? `post-${idx}`),
      slug: slug || `post-${idx}`,
      title,
      content: '',
      description,
      createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt as Date).toISOString(),
      image,
      author: String(p?.author ?? 'TechPlay'),
      tags,
    }
  })

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
          <div className="container-app relative z-10 grid gap-10 px-6 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-14 lg:py-16">
            <div className="space-y-6 sm:space-y-7">
              <span className="inline-block text-[var(--step-subtitle)] font-bold uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
                {t.heroBadge}
              </span>

              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-4xl md:text-5xl lg:text-[2.75rem] [line-height:var(--heading-leading)] [letter-spacing:var(--heading-tracking)]">
                {t.heroTitle}
              </h2>

              <p className="max-w-lg text-[var(--step-0)] font-medium leading-snug text-token-text/85">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/products"
                  prefetch={false}
                  className="btn btn-premium btn-lg inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[var(--step-0)] font-bold focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]"
                  data-gtm="home_hero_primary"
                >
                  {t.heroPrimaryCta}
                </Link>
                <Link
                  href="/products/packs"
                  prefetch={false}
                  className="btn btn-outline btn-lg inline-flex items-center gap-2 rounded-full border-[hsl(var(--border))] px-8 py-3.5 text-[var(--step-0)] font-semibold hover:bg-[hsl(var(--surface-2))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]"
                  data-gtm="home_hero_secondary"
                >
                  {t.heroSecondaryCta}
                </Link>
              </div>

              <TrustBadges
                variant="pill"
                compact
                className="!mt-4 !border-0 !bg-transparent !py-0 [&_ul]:!max-w-none [&_ul]:!px-0 [&_ul]:grid-cols-3"
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
                <Suspense fallback={<div className="skeleton h-full min-h-[280px] rounded-[var(--radius-2xl)] sm:min-h-[320px] lg:min-h-[380px]" />}>
                  <HeroCarousel overlayOpacity={0.25} textSize="xl" />
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

        <section
          id="blog"
          aria-label={t.blogSectionLabel}
          className="motion-section section-spacing-sm"
          style={lazySectionStyle600}
        >
          <SectionHeader kicker={t.blogKicker} title={t.blogTitle} sub={t.blogSub} />
          <div className="mt-8">
            {blogPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <BlogCard key={post._id} article={post} />
                ))}
              </div>
            ) : (
              <div className="card rounded-[var(--radius-2xl)] border-[hsl(var(--border))] p-8 text-center">
                <p className="text-token-text/70 mb-4">
                  {locale === 'en'
                    ? 'Best gaming keyboards 2026, setup guides, FPS tips — articles coming soon.'
                    : 'Meilleurs claviers gaming 2026, guides setup, astuces FPS — articles à venir.'}
                </p>
                <Link
                  href="/blog"
                  prefetch={false}
                  className="btn-premium inline-flex rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  {t.blogCta}
                </Link>
              </div>
            )}
            {blogPosts.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  prefetch={false}
                  className="btn-outline inline-flex rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  {t.blogCta}
                </Link>
              </div>
            )}
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