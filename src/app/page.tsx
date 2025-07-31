import { getBestProducts, getRecommendedPacks } from '@/lib/data'
import type { Metadata } from 'next'

import HeroCarousel from '@/components/HeroCarousel'
import BannerPromo from '@/components/BannerPromo'
import BestProducts from '@/components/BestProducts'
import PacksSection from '@/components/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import ScrollTopButton from '@/components/ui/ScrollTopButton'

export const metadata: Metadata = {
  title: 'TechPlay – Boutique high-tech & packs exclusifs',
  description: 'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
  keywords: 'TechPlay, high-tech, gadgets, offres, packs, dropshipping, boutique, innovation',
  openGraph: {
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description: 'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
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
    description: 'Découvrez les meilleures offres et packs TechPlay, sélectionnées pour vous avec passion et innovation.',
    creator: '@TechPlay',
  },
}

export default async function HomePage() {
  const [bestProducts, recommendedPacks] = await Promise.all([
    getBestProducts(),
    getRecommendedPacks(),
  ])

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'homepage_view')
  }

  return (
    <>
      <BannerPromo />

      <main
        className="space-y-28 px-6 max-w-screen-xl mx-auto scroll-smooth"
        role="main"
        tabIndex={-1}
      >
        {/* HERO CAROUSEL */}
        <section
          aria-label="Carrousel des produits en vedette"
          className="motion-section"
          id="hero"
        >
          <HeroCarousel />
        </section>

        {/* MEILLEURS PRODUITS */}
        <section
          aria-label="Meilleurs produits"
          className="motion-section"
          id="best-products"
        >
          <BestProducts products={bestProducts} />
        </section>

        {/* PACKS RECOMMANDÉS */}
        <section
          aria-label="Packs recommandés"
          className="motion-section"
          id="packs"
        >
          <PacksSection packs={recommendedPacks} />
        </section>

        {/* BADGES DE CONFIANCE */}
        <section
          aria-label="Badges de confiance TechPlay"
          className="motion-section"
        >
          <TrustBadges />
        </section>

        {/* FAQ */}
        <section
          aria-label="Foire aux questions"
          className="motion-section"
        >
          <FAQ />
        </section>
      </main>

      <ScrollTopButton />
    </>
  )
}
