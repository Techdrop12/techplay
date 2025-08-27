// src/app/page.tsx — Home ULTIME++ (perf/a11y/SEO centralisé, sans doublons)
import type { Metadata } from 'next'
import { Suspense, type ComponentProps } from 'react'
import dynamic from 'next/dynamic'

import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Product, Pack } from '@/types/product'
import TrustBadges from '@/components/TrustBadges'
import ClientTrackingScript from '@/components/ClientTrackingScript'
import Link from '@/components/LocalizedLink'
import { generateMeta } from '@/lib/seo'

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'))
const BestProducts = dynamic(() => import('@/components/BestProducts'), {
  loading: () => <SectionSkeleton title="Nos Meilleures Ventes" />,
})
const PacksSection = dynamic(() => import('@/components/PacksSection'), {
  loading: () => <SectionSkeleton title="Packs recommandés" />,
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <SectionSkeleton title="Questions fréquentes" />,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'

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

/* ------------------- Icônes inline (remplace les emojis) ------------------- */
function CatIcon({
  name,
  className = '',
}: {
  name: 'headphones' | 'keyboard' | 'mouse' | 'camera' | 'battery' | 'gift'
  className?: string
}) {
  switch (name) {
    case 'headphones':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a8 8 0 0 0-8 8v7a3 3 0 0 0 3 3h1v-8H7a1 1 0 0 0-1 1v6a2 2 0 1 1 0-4V11a6 6 0 1 1 12 0v5a2 2 0 0 1 0 4v-6a1 1 0 0 0-1-1h-1v8h1a3 3 0 0 0 3-3v-7a8 8 0 0 0-8-8Z"
          />
        </svg>
      )
    case 'keyboard':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 3h2v2H6V9Zm3 0h2v2H9V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9ZM6 12h2v2H6v-2Zm3 0h6v2H9v-2Zm7 0h2v2h-2v-2Z"
          />
        </svg>
      )
    case 'mouse':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a6 6 0 0 1 6 6v8a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8a6 6 0 0 1 6-6Zm0 2a4 4 0 0 0-4 4h4V4Zm0 0v4h4a4 4 0 0 0-4-4Z"
          />
        </svg>
      )
    case 'camera':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M9 4h6l1 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1-2Zm3 4a6 6 0 1 0 .001 12.001A6 6 0 0 0 12 8Zm0 2a4 4 0 1 1-.001 8.001A4 4 0 0 1 12 10Z"
          />
        </svg>
      )
    case 'battery':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h1v6h-1v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Zm3-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H6Z"
          />
        </svg>
      )
    case 'gift':
      return (
        <svg className={className} viewBox="0 0 24 24" width={28} height={28} aria-hidden="true">
          <path
            fill="currentColor"
            d="M20 7h-2.18A3 3 0 1 0 12 5a3 3 0 1 0-5.82 2H4a1 1 0 0 0-1 1v3h9V7h2v4h9V8a1 1 0 0 0-1-1ZM7 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3 12v7a2 2 0 0 0 2 2h7v-9H3Zm11 0v9h7a2 2 0 0 0 2-2v-7h-9Z"
          />
        </svg>
      )
  }
  return null
}

type CatName = ComponentProps<typeof CatIcon>['name']

function FeaturedCategories() {
  const CATS: ReadonlyArray<{ label: string; href: string; icon: CatName; desc: string }> = [
    { label: 'Casques',   href: '/products?cat=casques',   icon: 'headphones', desc: 'Audio immersif' },
    { label: 'Claviers',  href: '/products?cat=claviers',  icon: 'keyboard',   desc: 'Réactivité ultime' },
    { label: 'Souris',    href: '/products?cat=souris',    icon: 'mouse',      desc: 'Précision chirurgicale' },
    { label: 'Webcams',   href: '/products?cat=webcams',   icon: 'camera',     desc: 'Visio en HD' },
    { label: 'Batteries', href: '/products?cat=batteries', icon: 'battery',    desc: 'Autonomie boost' },
    { label: 'Packs',     href: '/products/packs',         icon: 'gift',       desc: 'Offres combinées' },
  ]
  return (
    <section id="categories" aria-labelledby="cats-title" className="motion-section">
      <SectionHeader
        kicker="Explorer"
        title="Catégories incontournables"
        sub="Des sélections pointues pour aller droit au but."
      />
      <h3 id="cats-title" className="sr-only">Catégories vedettes</h3>
      <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {CATS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              prefetch={false}
              className="group block rounded-2xl border border-token-border bg-token-surface/70 backdrop-blur shadow-sm transition hover:shadow-elevated focus-ring p-4 sm:p-5"
              data-gtm="home_cat_card"
              data-cat={c.label}
              aria-label={`Voir la catégorie ${c.label} — ${c.desc}`}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/.10)] text-[hsl(var(--accent))]"
              >
                <CatIcon name={c.icon} />
              </span>
              <div className="mt-3 font-semibold">{c.label}</div>
              <div className="text-xs text-token-text/60">{c.desc}</div>
              <div className="mt-3 text-xs font-semibold text-[hsl(var(--accent))] opacity-0 transition group-hover:opacity-100">
                Voir →
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SplitCTA() {
  return (
    <section
      aria-label="Appel à l’action"
      className="motion-section relative overflow-hidden rounded-3xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-6 sm:p-10 shadow-elevated"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' } as any}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-token-text/10 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-[hsl(var(--accent))]/90">Offre du moment</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
            Boostez votre setup en <span className="text-gradient">un clic</span>
          </h3>
          <p className="mt-3 text-sm sm:text-base text-token-text/70">
            Packs optimisés, meilleurs prix, livraison rapide.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/products/packs"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              data-gtm="home_cta_packs"
            >
              Découvrir les packs
            </Link>
            <Link
              href="/products"
              prefetch={false}
              className="inline-flex items-center rounded-xl border border-token-border bg-token-surface px-5 py-3 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              data-gtm="home_cta_products"
            >
              Voir les produits
            </Link>
          </div>
        </div>
        <div className="min-h-[180px] rounded-2xl border border-token-border bg-token-surface/60 shadow-elevated" />
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    { name: 'Léa',    text: 'Livraison rapide et clavier incroyable, je recommande !' },
    { name: 'Maxime', text: 'Service client réactif, pack super rentable.' },
    { name: 'Amine',  text: 'Qualité au top, site fluide et clair.' },
  ]
  return (
    <section aria-label="Témoignages clients" className="motion-section">
      <SectionHeader kicker="Avis" title="Les clients en parlent" sub="Une communauté exigeante et satisfaite." />
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
      <h1 className="sr-only">TechPlay – Boutique high-tech & packs exclusifs</h1>
      <ClientTrackingScript event="homepage_view" />

      {/* Glow décoratif global */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 -top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      </div>

      <main id="main" className="mx-auto max-w-screen-xl scroll-smooth px-4 sm:px-6 space-y-24 md:space-y-28" role="main" tabIndex={-1}>
        <section aria-label="Carrousel des produits en vedette" className="motion-section" id="hero">
          <Suspense fallback={<div className="h-40 sm:h-56 lg:h-72 rounded-2xl skeleton" />}>
            <HeroCarousel />
            <noscript><p><a href="/products">Voir les produits</a></p></noscript>
          </Suspense>
        </section>

        <FeaturedCategories />

        <section
          aria-label="Meilleures ventes TechPlay"
          className="motion-section"
          id="best-products"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker="Top ventes"
            title="Nos Meilleures Ventes"
            sub="Les favoris de la communauté – stock limité."
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Nos Meilleures Ventes" />}>
              <BestProducts products={bestProducts} showTitle={false} />
            </Suspense>
          </div>
        </section>

        <section
          aria-label="Packs TechPlay recommandés"
          className="motion-section"
          id="packs"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' } as any}
        >
          <SectionHeader
            kicker="Bundle"
            title="Packs recommandés"
            sub="Des combinaisons pensées pour la performance et l’économie."
          />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Packs recommandés" />}>
              <PacksSection packs={recommendedPacks} />
            </Suspense>
          </div>
        </section>

        <Testimonials />
        <SplitCTA />

        <section
          aria-label="Questions fréquentes de nos clients"
          className="motion-section"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' } as any}
        >
          <SectionHeader kicker="FAQ" title="Questions fréquentes" />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Questions fréquentes" />}>
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
