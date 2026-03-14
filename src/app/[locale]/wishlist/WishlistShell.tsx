'use client'

import dynamic from 'next/dynamic'

const WishlistClientPage = dynamic(() => import('./WishlistClient'), {
  ssr: false,
  loading: () => (
    <main
      className="container-app mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-6 h-10 w-72 max-w-full animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="mb-4 h-4 w-full max-w-xl animate-pulse rounded-lg bg-[hsl(var(--surface-2))]/80" />
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