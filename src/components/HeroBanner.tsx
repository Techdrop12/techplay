// src/components/HeroBanner.js — simple, propre, i18n-safe
import Link from '@/components/LocalizedLink'

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
        className="inline-block bg-[hsl(var(--surface))] text-[hsl(var(--accent))] font-semibold px-6 py-3 rounded-xl shadow-[var(--shadow-sm)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]"
        aria-label="Explorer les produits TechPlay"
      >
        Explorer les produits
      </Link>
    </section>
  )
}
