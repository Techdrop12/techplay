'use client'

import Link from '@/components/LocalizedLink'

export default function Error({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16" role="main" aria-labelledby="cart-error-title">
      <div className="rounded-[1.5rem] border border-red-200/60 bg-red-50/50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <h1 id="cart-error-title" className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          Oups, le panier a rencontré un problème
        </h1>
        <p className="mt-2 text-[13px] text-gray-600 dark:text-gray-400">{error?.message}</p>
        <p className="mt-3 text-[13px] text-gray-500 dark:text-gray-500">
          Réessayez ou videz le panier si le problème persiste.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.4)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
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
