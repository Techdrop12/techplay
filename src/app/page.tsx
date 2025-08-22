// src/app/page.tsx — Home Ultra Premium (polish + bannière retirée)
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Product, Pack } from '@/types/product'

// ⛔️ Bannière retirée (gardée en option via UI flag si tu veux la réactiver)
// import BannerPromo from '@/components/BannerPromo'
import TrustBadges from '@/components/TrustBadges'
import ClientTrackingScript from '@/components/ClientTrackingScript'

/* ───────────────────────────── Dynamic chunks ───────────────────────────── */
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'))
const BestProducts = dynamic(
  () => import('@/components/BestProducts'),
  { loading: () => <SectionSkeleton title="Nos Meilleures Ventes" /> }
)
const PacksSection = dynamic(
  () => import('@/components/PacksSection'),
  { loading: () => <SectionSkeleton title="Packs recommandés" /> }
)
const FAQ = dynamic(
  () => import('@/components/FAQ'),
  { loading: () => <SectionSkeleton title="Questions fréquentes" /> }
)

/* ────────────────────────────── Page metadata ───────────────────────────── */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = {
  title: 'TechPlay – Boutique high-tech & packs exclusifs',
  description:
    'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation. Casques, souris, claviers, et accessoires gaming de qualité supérieure.',
  keywords:
    'TechPlay, boutique high-tech, gadgets innovants, accessoires gaming, packs exclusifs, technologie, électronique, audio, clavier, souris, casque, innovation',
  openGraph: {
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description:
      'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
    url: SITE_URL,
    siteName: 'TechPlay',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'TechPlay – Accueil' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description:
      'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
    creator: '@TechPlay',
    images: [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
}

/* ───────────────────────────── ISR revalidation ─────────────────────────── */
export const revalidate = 300 // 5 minutes

/* ─────────────────────── UI helpers (section header…) ───────────────────── */
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
    <header className={center ? 'text-center max-w-3xl mx-auto' : ''}>
      {kicker && (
        <p className="text-xs tracking-widest uppercase font-bold text-[hsl(var(--accent))]/90">
          {kicker}
        </p>
      )}
      <Tag className="mt-2 text-balance font-extrabold tracking-tight text-[clamp(1.75rem,3vw+1rem,2.5rem)]">
        <span className="text-gradient">{title}</span>
      </Tag>
      {sub && (
        <p className="mt-3 text-sm sm:text-base text-token-text/70">
          {sub}
        </p>
      )}
    </header>
  )
}

function FeaturedCategories() {
  // ⚠️ On route vers /produit avec filtre de catégorie pour éviter les 404 tant que /categorie/* n'est pas prêt
  const CATS: Array<{ label: string; href: string; emoji: string; desc: string }> = [
    { label: 'Casques',   href: '/produit?cat=casques',   emoji: '🎧', desc: 'Audio immersif' },
    { label: 'Claviers',  href: '/produit?cat=claviers',  emoji: '⌨️', desc: 'Réactivité ultime' },
    { label: 'Souris',    href: '/produit?cat=souris',    emoji: '🖱️', desc: 'Précision chirurgicale' },
    { label: 'Webcams',   href: '/produit?cat=webcams',   emoji: '📷', desc: 'Visio en HD' },
    { label: 'Batteries', href: '/produit?cat=batteries', emoji: '🔋', desc: 'Autonomie boost' },
    { label: 'Packs',     href: '/pack',                  emoji: '🎁', desc: 'Offres combinées' },
  ]
  return (
    <section id="categories" aria-label="Catégories vedettes" className="motion-section">
      <SectionHeader kicker="Explorer" title="Catégories incontournables" sub="Des sélections pointues pour aller droit au but." />
      <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {CATS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              prefetch={false}
              className="group block rounded-2xl border border-token-border bg-token-surface/70 backdrop-blur shadow-sm transition hover:shadow-elevated focus-ring p-4 sm:p-5"
              data-gtm="home_cat_card"
              data-cat={c.label}
            >
              <div className="text-3xl sm:text-4xl">{c.emoji}</div>
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
              href="/pack"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              data-gtm="home_cta_packs"
            >
              Découvrir les packs
            </Link>
            <Link
              href="/produit"
              prefetch={false}
              className="inline-flex items-center rounded-xl border border-token-border bg-token-surface px-5 py-3 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              data-gtm="home_cta_products"
            >
              Voir les produits
            </Link>
          </div>
        </div>
        {/* Slot visuel (image/3D/particles) prêt si tu veux le brancher plus tard */}
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
          <li
            key={i}
            className="rounded-2xl border border-token-border bg-token-surface/70 p-5 shadow-soft"
          >
            <p className="text-sm text-token-text/90">“{t.text}”</p>
            <p className="mt-3 text-sm font-semibold">— {t.name}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* Skeleton doux pour Suspense */
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

/* ───────────────────────────────── Page ─────────────────────────────────── */
export default async function HomePage() {
  let bestProducts: Product[] = []
  let recommendedPacks: Pack[] = []
  try {
    ;[bestProducts, recommendedPacks] = await Promise.all([
      getBestProducts(),
      getRecommendedPacks(),
    ])
  } catch {
    // soft-fail : les sections afficheront des skeletons
  }

  /* JSON-LD ItemList pour SEO produits */
  const itemListJsonLd =
    Array.isArray(bestProducts) && bestProducts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: bestProducts.slice(0, 8).map((p: any, idx: number) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: p?.slug ? `${SITE_URL}/produit/${p.slug}` : `${SITE_URL}/produit`,
            name: p?.title ?? 'Produit',
          })),
        }
      : null

  /* JSON-LD WebSite (sitelinks search box) */
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'TechPlay',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/produit?q={search_term_string}`, // ✅ aligne avec la route existante
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <h1 className="sr-only">TechPlay – Boutique high-tech & packs exclusifs</h1>
      <ClientTrackingScript event="homepage_view" />

      {/* ⛔️ Bandeau promo retiré */}
      {/* <BannerPromo /> */}

      {/* Glow décoratif global */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 -top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[hsl(var(--accent)/.20)] blur-3xl" />
      </div>

      <main
        className="mx-auto max-w-screen-xl scroll-smooth px-4 sm:px-6 space-y-24 md:space-y-28"
        role="main"
        tabIndex={-1}
      >
        {/* Hero carousel */}
        <section aria-label="Carrousel des produits en vedette" className="motion-section" id="hero">
          <Suspense fallback={<div className="h-40 sm:h-56 lg:h-72 rounded-2xl skeleton" />}>
            <HeroCarousel />
            <noscript><p><a href="/produit">Voir les produits</a></p></noscript>
          </Suspense>
        </section>

        {/* Catégories */}
        <FeaturedCategories />

        {/* Meilleures ventes */}
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

        {/* Packs */}
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

        {/* Témoignages */}
        <Testimonials />

        {/* CTA premium */}
        <SplitCTA />

        {/* FAQ */}
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

        {/* Badges de confiance */}
        <TrustBadges variant="premium" className="mt-10" />
      </main>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {itemListJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      ) : null}
    </>
  )
}
