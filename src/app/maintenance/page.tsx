import Link from '@/components/LocalizedLink'

export default function MaintenancePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      role="main"
      aria-labelledby="maintenance-title"
    >
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:bg-[hsl(var(--surface))]/90 sm:p-10">
        <h1 id="maintenance-title" className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Maintenance en cours
        </h1>
        <p className="mt-3 text-[15px] text-gray-600 dark:text-gray-300">
          Le site est actuellement en cours d&apos;amélioration. Merci de revenir plus tard.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-2.5 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.4)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
          prefetch={false}
        >
          Actualiser la page
        </Link>
      </div>
    </main>
  )
}
