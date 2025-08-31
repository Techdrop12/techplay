// src/components/HeroBanner.js — simple, propre, i18n-safe
import Link from 'next/link'

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-16 text-center px-4 rounded-none sm:rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        Bienvenue chez TechPlay
      </h1>
      <p className="text-lg max-w-2xl mx-auto mb-6 opacity-95">
        Découvrez les meilleurs gadgets high-tech et accessoires innovants. Livraison rapide. SAV premium.
      </p>
      <Link
        href="/products"
        prefetch
        className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        aria-label="Explorer les produits TechPlay"
      >
        Explorer les produits
      </Link>
    </section>
  )
}
