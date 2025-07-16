import HeroCarousel from '@/components/home/HeroCarousel'
import BestProducts from '@/components/home/BestProducts'
import PacksSection from '@/components/home/PacksSection'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <BestProducts />
      <PacksSection />
      <TrustBadges />
      <FAQ />
    </>
  )
}
