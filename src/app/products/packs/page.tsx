// src/app/products/packs/page.tsx
import { Suspense } from 'react'

import type { Pack } from '@/types/product'
import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'
import PackCard from '@/components/PackCard'
import SectionTitle from '@/components/SectionTitle'
import SectionWrapper from '@/components/SectionWrapper'
import { BRAND } from '@/lib/constants'
import { getRecommendedPacks } from '@/lib/data'

export const revalidate = 900

const SITE = BRAND.URL

export const metadata: Metadata = {
  title: 'Nos Packs',
  description: 'Découvrez nos packs exclusifs et thématiques à prix réduits.',
  alternates: { canonical: `${SITE}/products/packs` },
  openGraph: {
    title: 'Nos Packs',
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
        <div className="text-center text-token-text/70 py-10">
          <p className="mb-4">Aucun pack disponible pour le moment.</p>
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-white font-semibold hover:bg-[hsl(var(--accent)/.92)] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
            >
              Voir tous les produits
            </Link>
            <Link
              href="/products?cat=casques"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] focus-visible:ring-offset-2"
            >
              Casques 🎧
            </Link>
            <Link
              href="/products?cat=claviers"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] focus-visible:ring-offset-2"
            >
              Claviers ⌨️
            </Link>
            <Link
              href="/products?cat=souris"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] focus-visible:ring-offset-2"
            >
              Souris 🖱️
            </Link>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--surface-2))]" aria-hidden />
              ))}
            </div>
          }
        >
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
