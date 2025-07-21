import PackCard from '@/components/PackCard'
import { getRecommendedPacks } from '@/lib/data'
import type { Metadata } from 'next'
import type { Pack } from '@/types/product'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Nos Packs – TechPlay',
  description: 'Découvrez nos packs exclusifs et thématiques à prix réduits.',
  alternates: {
    canonical: '/pack',
  },
}

export default async function PackListPage() {
  const packs: Pack[] = await getRecommendedPacks()

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-brand">
        Nos Packs exclusifs
      </h1>

      {packs.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun pack disponible pour le moment.
        </p>
      ) : (
        <Suspense
          fallback={
            <div className="text-center text-gray-400 py-6">
              Chargement des packs...
            </div>
          }
        >
          <section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-labelledby="packs-heading"
          >
            {packs.map((pack) => (
              <PackCard key={pack.slug} pack={pack} />
            ))}
          </section>
        </Suspense>
      )}
    </main>
  )
}
