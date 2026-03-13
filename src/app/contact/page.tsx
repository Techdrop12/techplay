import Link from '@/components/LocalizedLink'

export default function ContactPage() {
  return (
    <main className="container-app mx-auto max-w-2xl pt-28 pb-20" role="main" aria-labelledby="contact-title">
      <div className="card p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
        <h1 id="contact-title" className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-3xl [letter-spacing:var(--heading-tracking)]">
          Contact
        </h1>
        <p className="mt-3 text-[var(--step-0)] text-token-text/75">
          Envie de nous écrire ? Contactez-nous par email.
        </p>
        <a
          href="mailto:support@techplay.fr"
          className="btn-premium mt-4 inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
        >
          support@techplay.fr
        </a>
        <p className="mt-8 text-[13px] text-token-text/70">
          <Link href="/" className="font-medium text-[hsl(var(--accent))] transition hover:opacity-90" prefetch={false}>
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </main>
  )
}
