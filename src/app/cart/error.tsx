'use client'

import Link from '@/components/LocalizedLink'

export default function Error({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16" role="main" aria-labelledby="cart-error-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-md)]">
        <h1 id="cart-error-title" className="heading-page text-xl sm:text-2xl">
          Oups, le panier a rencontré un problème
        </h1>
        <p className="mt-2 text-[13px] text-token-text/80">{error?.message}</p>
        <p className="mt-3 text-[13px] text-token-text/60">
          Réessayez ou videz le panier si le problème persiste.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
          >
            Revenir au panier
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-sm font-medium text-token-text transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    </main>
  )
}
