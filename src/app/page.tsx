import HeroCarousel from '@/components/HeroCarousel'
import BestProducts from '@/components/BestProducts'
import PacksSection from '@/components/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TechPlay - Accueil',
  description: 'Découvrez les meilleures offres et packs TechPlay.',
}

export default function HomePage() {
  return (
    <main className="space-y-20 px-4">
      <section>
        <HeroCarousel />
      </section>
      <section>
        <BestProducts />
      </section>
      <section>
        <PacksSection />
      </section>
      <section>
        <TrustBadges />
      </section>
      <section>
        <FAQ />
      </section>
    </main>
  )
}
