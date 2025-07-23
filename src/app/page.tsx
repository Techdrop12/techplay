import HeroCarousel from '@/components/HeroCarousel'
import BestProducts from '@/components/BestProducts'
import PacksSection from '@/components/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import type { Metadata } from 'next'
import { getBestProducts } from '@/lib/data'  // <-- importer la fonction serveur

export const metadata: Metadata = {
  title: 'TechPlay - Accueil',
  description: 'Découvrez les meilleures offres et packs TechPlay.',
}

export default async function HomePage() {
  const bestProducts = await getBestProducts()  // appel serveur OK ici

  return (
    <main className="space-y-20 px-4">
      <section>
        <HeroCarousel />
      </section>
      <section>
        <BestProducts products={bestProducts} /> {/* passer via props */}
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
