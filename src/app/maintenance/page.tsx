import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'

export const metadata: Metadata = {
  title: 'Maintenance',
  description: 'TechPlay est temporairement en maintenance. Revenez dans quelques instants.',
  robots: { index: false, follow: true },
}

export default function MaintenancePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      role="main"
      aria-labelledby="maintenance-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
        <h1 id="maintenance-title" className="heading-page sm:text-3xl">
          Maintenance en cours
        </h1>
        <p className="mt-3 text-[15px] text-token-text/75">
          Le site est actuellement en cours d&apos;amélioration. Merci de revenir plus tard.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
          prefetch={false}
        >
          Actualiser la page
        </Link>
      </div>
    </main>
  )
}
