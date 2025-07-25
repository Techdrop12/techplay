import HeroCarousel from '@/components/HeroCarousel'
import BestProducts from '@/components/BestProducts'
import PacksSection from '@/components/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import type { Metadata } from 'next'
import { getBestProducts, getRecommendedPacks } from '@/lib/data'

export const metadata: Metadata = {
  title: 'TechPlay – Boutique high-tech & packs exclusifs',
  description:
    'Découvrez les meilleures offres et packs TechPlay, sélectionnés pour vous avec passion et innovation.',
  keywords: 'TechPlay, high-tech, gadgets, offres, packs, dropshipping, boutique, innovation',
  openGraph: {
    title: 'TechPlay – Boutique high-tech & packs exclusifs',
    description:
      'Découvrez les meilleures offres et packs TechPlay, sélectionnés pour vous avec passion et innovation.',
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
    description: 'Découvrez les meilleures offres et packs TechPlay, sélectionnés pour vous avec passion et innovation.',
    creator: '@TechPlay',
  },
}

export default async function HomePage() {
  const bestProducts = await getBestProducts()
  const recommendedPacks = await getRecommendedPacks()

  return (
    <main className="space-y-28 px-6 max-w-screen-xl mx-auto" role="main" tabIndex={-1}>
      <section aria-label="Carrousel des produits en vedette">
        <HeroCarousel />
      </section>
      <section
        aria-label="Meilleurs produits"
        className="animate-fadeIn"
      >
        <BestProducts products={bestProducts} />
      </section>
      <section
        aria-label="Packs recommandés"
        className="animate-fadeIn"
      >
        <PacksSection packs={recommendedPacks} />
      </section>
      <section aria-label="Badges de confiance TechPlay" className="animate-fadeIn">
        <TrustBadges />
      </section>
      <section aria-label="Foire aux questions" className="animate-fadeIn">
        <FAQ />
      </section>
    </main>
  )
}
