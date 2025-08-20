// src/app/produit/[slug]/not-found.tsx
import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'
import type { Product } from '@/types/product'
import { getBestProducts } from '@/lib/data'

export const revalidate = 300

export default async function ProductNotFound() {
  let suggestions: Product[] = []
  try {
    suggestions = await getBestProducts()
    if (!suggestions?.length) suggestions = []
  } catch {
    suggestions = []
  }

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold">Produit introuvable</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Le produit que vous cherchez n’existe plus ou a changé d’URL.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/produit"
            className="rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          >
            Voir tous les produits
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Suggestions pour vous</h2>
          <ProductGrid products={suggestions} showWishlistIcon />
        </section>
      )}
    </main>
  )
}
