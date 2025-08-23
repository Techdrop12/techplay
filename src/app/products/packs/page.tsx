import type { Metadata } from 'next'
import { Suspense } from 'react'
import PackCard from '@/components/PackCard'
import SectionTitle from '@/components/SectionTitle'
import SectionWrapper from '@/components/SectionWrapper'
import type { Pack } from '@/types/product'
import { getRecommendedPacks } from '@/lib/data'

export const revalidate = 900

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Nos Packs – TechPlay',
  description: 'Découvrez nos packs exclusifs et thématiques à prix réduits.',
  alternates: { canonical: `${SITE}/products/packs` },
  openGraph: {
    title: 'Nos Packs – TechPlay',
    description: 'Découvrez nos packs exclusifs et thématiques à prix réduits.',
    type: 'website',
    url: `${SITE}/products/packs`,
  },
}

export default async function PacksPage() {
  const packs: Pack[] = await getRecommendedPacks()

  return (
    <SectionWrapper>
      <SectionTitle title="Nos Packs" />
      {packs.length === 0 ? (
        <p className="text-center text-gray-500">Aucun pack disponible pour le moment.</p>
      ) : (
        <Suspense fallback={<div className="text-center text-gray-400 py-6">Chargement des packs…</div>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <PackCard key={pack.slug} pack={pack} />
            ))}
          </div>
        </Suspense>
      )}
    </SectionWrapper>
  )
}
