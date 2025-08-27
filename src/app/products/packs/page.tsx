// src/app/products/packs/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import PackCard from '@/components/PackCard'
import SectionTitle from '@/components/SectionTitle'
import SectionWrapper from '@/components/SectionWrapper'
import type { Pack } from '@/types/product'
import { getRecommendedPacks } from '@/lib/data'

export const revalidate = 900

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

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
        <div className="text-center text-gray-600 dark:text-gray-400 py-10">
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
              className="rounded-xl border border-token-border bg-token-surface px-4 py-2 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
            >
              Casques 🎧
            </Link>
            <Link
              href="/products?cat=claviers"
              className="rounded-xl border border-token-border bg-token-surface px-4 py-2 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
            >
              Claviers ⌨️
            </Link>
            <Link
              href="/products?cat=souris"
              className="rounded-xl border border-token-border bg-token-surface px-4 py-2 font-semibold hover:shadow focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
            >
              Souris 🖱️
            </Link>
          </div>
        </div>
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
