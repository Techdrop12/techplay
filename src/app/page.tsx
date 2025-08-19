import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Metadata } from 'next'

import HeroCarousel from '@/components/HeroCarousel'
import BannerPromo from '@/components/BannerPromo'
import BestProducts from '@/components/BestProducts'
import PacksSection from '@/components/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import ScrollTopButton from '@/components/ui/ScrollTopButton'
import ClientTrackingScript from '@components/ClientTrackingScript'// → tracking Google Analytics client-side

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
    url: 'https://techplay.example.com',
    siteName: 'TechPlay',
    images: [
      {
        url: 'https://techplay.example.com/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'TechPlay – Accueil',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description:
      'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
    creator: '@TechPlay',
  },
}

export default async function HomePage() {
  const [bestProducts, recommendedPacks] = await Promise.all([
    getBestProducts(),
    getRecommendedPacks(),
  ])

  return (
    <>
      {/* 🎯 Tracking Google Analytics côté client */}
      <ClientTrackingScript event="homepage_view" />

      {/* 🔥 Bannière de promo journalière */}
      <BannerPromo />

      <main
        className="space-y-28 px-4 sm:px-6 max-w-screen-xl mx-auto scroll-smooth"
        role="main"
        tabIndex={-1}
      >
        {/* 🎥 Carrousel Hero */}
        <section
          aria-label="Carrousel des produits en vedette"
          className="motion-section"
          id="hero"
        >
          <HeroCarousel />
        </section>

        {/* 🏆 Meilleures ventes */}
        <section
          aria-label="Meilleures ventes TechPlay"
          className="motion-section"
          id="best-products"
        >
          <BestProducts products={bestProducts} />
        </section>

        {/* 🎁 Packs recommandés */}
        <section
          aria-label="Packs TechPlay recommandés"
          className="motion-section"
          id="packs"
        >
          <PacksSection packs={recommendedPacks} />
        </section>

        {/* ✅ Badges de confiance */}
        <section
          aria-label="Nos garanties de confiance"
          className="motion-section"
        >
          <TrustBadges />
        </section>

        {/* ❓ Foire aux questions */}
        <section
          aria-label="Questions fréquentes de nos clients"
          className="motion-section"
        >
          <FAQ />
        </section>
      </main>

      {/* ⬆️ Bouton retour haut de page */}
      <ScrollTopButton />
    </>
  )
}
