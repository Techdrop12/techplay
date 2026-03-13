import Link from '@/components/LocalizedLink'

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" role="main" aria-labelledby="mentions-title">
      <div className="rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:bg-[hsl(var(--surface))]/90 sm:p-8">
        <h1 id="mentions-title" className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Mentions légales
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          Éditeur du site : TechPlay • Siège social : Paris, France • Contact : contact@techplay.fr
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
