'use client'

import dynamic from 'next/dynamic'

const WishlistClientPage = dynamic(() => import('./WishlistClient'), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-live="polite">
      <div className="mb-6 h-10 w-64 max-w-full animate-pulse rounded-xl bg-token-surface-2" />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-3xl border border-token-border bg-token-surface/70"
          />
        ))}
      </div>
    </main>
  ),
})

export default function WishlistShell() {
  return <WishlistClientPage />
}