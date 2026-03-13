'use client'

import dynamic from 'next/dynamic'

const WishlistClientPage = dynamic(() => import('./WishlistClient'), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="mb-8 h-10 w-72 max-w-full animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-[hsl(var(--surface))]/80 dark:bg-[hsl(var(--surface))]/60"
          />
        ))}
      </div>
    </main>
  ),
})

export default function WishlistShell() {
  return <WishlistClientPage />
}