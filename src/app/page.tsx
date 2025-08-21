// src/app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { getBestProducts, getRecommendedPacks } from '@/lib/data'

import BannerPromo from '@/components/BannerPromo'
import TrustBadges from '@/components/TrustBadges'
import ScrollTopButton from '@/components/ui/ScrollTopButton'
import ClientTrackingScript from '@components/ClientTrackingScript'

// ✅ Dynamic import des blocs lourds (meilleur TTI sans sacrifier SEO)
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  // le hero reste SSR (pas de ssr:false) pour conserver le LCP/SEO
})
const BestProducts = dynamic(() => import('@/components/BestProducts'), {
  loading: () => <SectionSkeleton title="Nos Meilleures Ventes" />,
})
const PacksSection = dynamic(() => import('@/components/PacksSection'), {
  loading: () => <SectionSkeleton title="Packs recommandés" />,
})
const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <SectionSkeleton title="Questions fréquentes" />,
})

/* ------------------------------ Metadata page ----------------------------- */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'

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
    images: [{ url: `${SITE_URL}/og-homepage.jpg`, width: 1200, height: 630, alt: 'TechPlay – Accueil' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description:
      'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
    creator: '@TechPlay',
    images: [`${SITE_URL}/og-homepage.jpg`],
  },
}

/* ---------------------------- Revalidation ISR ---------------------------- */
// Contenu reconstruit côté serveur toutes les X minutes (sans rebuild complet)
export const revalidate = 300 // 5 minutes

/* ---------- Mini composants purement présentations (pas d’état) ---------- */
function SectionHeader({
  kicker,
  title,
  sub,
  center = true,
}: {
  kicker?: string
  title: string
  sub?: string
  center?: boolean
}) {
  return (
    <header className={center ? 'text-center max-w-3xl mx-auto' : ''}>
      {kicker ? <p className="text-xs tracking-widest uppercase font-bold text-accent/90">{kicker}</p> : null}
      <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
        <span className="text-brand dark:text-brand-light">{title}</span>
        <span className="text-accent">.</span>
      </h2>
      {sub ? <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">{sub}</p> : null}
    </header>
  )
}

function FeaturedCategories() {
  const CATS: Array<{ label: string; href: string; emoji: string; desc: string }> = [
    { label: 'Casques', href: '/categorie/casques', emoji: '🎧', desc: 'Audio immersif' },
    { label: 'Claviers', href: '/categorie/claviers', emoji: '⌨️', desc: 'Réactivité ultime' },
    { label: 'Souris', href: '/categorie/souris', emoji: '🖱️', desc: 'Précision chirurgicale' },
    { label: 'Webcams', href: '/categorie/webcams', emoji: '📷', desc: 'Visio en HD' },
    { label: 'Batteries', href: '/categorie/batteries', emoji: '🔋', desc: 'Autonomie boost' },
    { label: 'Packs', href: '/pack', emoji: '🎁', desc: 'Offres combinées' },
  ]
  return (
    <section id="categories" aria-label="Catégories vedettes" className="motion-section">
      <SectionHeader
        kicker="Explorer"
        title="Catégories incontournables"
        sub="Des sélections pointues pour aller droit au but."
      />
      <ul role="list" className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {CATS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              prefetch={false}
              className="group block rounded-2xl p-4 sm:p-5 border border-gray-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm hover:shadow-xl transition focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              <div className="text-3xl sm:text-4xl">{c.emoji}</div>
              <div className="mt-3 font-semibold">{c.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</div>
              <div className="mt-3 text-xs text-accent font-semibold opacity-0 group-hover:opacity-100 transition">Voir →</div>
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
      className="relative motion-section overflow-hidden rounded-3xl border border-gray-200/70 dark:border-zinc-800 bg-gradient-to-br from-accent/10 via-transparent to-brand/10 p-6 sm:p-10 shadow-xl"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-2 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-accent/90">Promo du jour</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
            Boostez votre setup en <span className="text-accent">un clic</span>
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Nos packs combinent les meilleurs accessoires au meilleur prix, avec livraison rapide et support 7j/7.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/pack"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-accent text-white px-5 py-3 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              Découvrir les packs
            </Link>
            <Link
              href="/produit"
              prefetch={false}
              className="inline-flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 px-5 py-3 font-semibold hover:shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              Voir les produits
            </Link>
          </div>
        </div>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          {['Paiement sécurisé (Stripe, PayPal)', 'Livraison 48–72h', 'Support client 7j/7', 'Satisfait ou remboursé'].map(
            (t) => (
              <li key={t} className="rounded-xl border border-gray-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-4 py-3">
                ✅ {t}
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    { name: 'Léa', text: 'Livraison rapide et clavier incroyable, je recommande !' },
    { name: 'Maxime', text: 'Service client réactif, pack super rentable.' },
    { name: 'Amine', text: 'Qualité au top, site fluide et clair.' },
  ]
  return (
    <section aria-label="Témoignages clients" className="motion-section">
      <SectionHeader kicker="Avis" title="Les clients en parlent" sub="Une communauté exigeante et satisfaite." />
      <ul role="list" className="mt-8 grid gap-4 sm:grid-cols-3">
        {items.map((t, i) => (
          <li key={i} className="rounded-2xl border border-gray-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-5 shadow-sm">
            <p className="text-sm text-gray-700 dark:text-gray-300">“{t.text}”</p>
            <p className="mt-3 text-sm font-semibold">— {t.name}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Fallback visuel léger pour Suspense
function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="motion-section">
      <SectionHeader title={title} />
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl h-40 bg-gray-200/60 dark:bg-zinc-800/60" />
        ))}
      </div>
    </section>
  )
}

/* --------------------------------- PAGE ---------------------------------- */
export default async function HomePage() {
  // Récup data robuste (aucun crash si l’API tombe)
  let bestProducts: any[] = []
  let recommendedPacks: any[] = []
  try {
    ;[bestProducts, recommendedPacks] = await Promise.all([getBestProducts(), getRecommendedPacks()])
  } catch {
    // on garde des listes vides → UI skeletons visibles
  }

  // JSON-LD ItemList (meilleures ventes)
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

  return (
    <>
      {/* H1 accessible (si le Hero n’en expose pas) */}
      <h1 className="sr-only">TechPlay – Boutique high-tech & packs exclusifs</h1>

      {/* 🎯 Tracking Google Analytics côté client */}
      <ClientTrackingScript event="homepage_view" />

      {/* 🔥 Bandeau promo */}
      <BannerPromo />

      {/* Décor doux (glow) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <main className="space-y-28 px-4 sm:px-6 max-w-screen-xl mx-auto scroll-smooth" role="main" tabIndex={-1}>
        {/* 🎥 Hero */}
        <section aria-label="Carrousel des produits en vedette" className="motion-section" id="hero">
          <Suspense>
            <HeroCarousel />
          </Suspense>
        </section>

        {/* 🗂️ Catégories vedettes */}
        <FeaturedCategories />

        {/* 🏆 Meilleures ventes (stream + skeleton) */}
        <section aria-label="Meilleures ventes TechPlay" className="motion-section" id="best-products">
          <SectionHeader kicker="Top ventes" title="Nos Meilleures Ventes" sub="Les favoris de la communauté – stock limité." />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Nos Meilleures Ventes" />}>
              <BestProducts products={bestProducts} />
            </Suspense>
          </div>
        </section>

        {/* 🎁 Packs recommandés (stream + skeleton) */}
        <section aria-label="Packs TechPlay recommandés" className="motion-section" id="packs">
          <SectionHeader kicker="Bundle" title="Packs recommandés" sub="Des combinaisons pensées pour la performance et l’économie." />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Packs recommandés" />}>
              <PacksSection packs={recommendedPacks} />
            </Suspense>
          </div>
        </section>

        {/* 💬 Témoignages simples */}
        <Testimonials />

        {/* ✅ Badges de confiance */}
        <section aria-label="Nos garanties de confiance" className="motion-section">
          <TrustBadges />
        </section>

        {/* ⚡ CTA premium */}
        <SplitCTA />

        {/* ❓ Foire aux questions */}
        <section aria-label="Questions fréquentes de nos clients" className="motion-section">
          <SectionHeader kicker="FAQ" title="Questions fréquentes" />
          <div className="mt-8">
            <Suspense fallback={<SectionSkeleton title="Questions fréquentes" />}>
              <FAQ />
            </Suspense>
          </div>
        </section>
      </main>

      {/* JSON-LD (ItemList) */}
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}

      {/* ⬆️ Retour haut */}
      <ScrollTopButton />
    </>
  )
}
