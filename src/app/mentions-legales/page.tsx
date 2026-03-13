import Link from '@/components/LocalizedLink'

export default function MentionsLegalesPage() {
  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="mentions-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]">
        <h1 id="mentions-title" className="heading-page mb-6">
          Mentions légales
        </h1>
        <p className="text-[15px] leading-relaxed text-token-text/85">
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
