import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'

const SUPPORT_EMAIL = 'support@techplay.fr'

export const metadata: Metadata = {
  title: 'Nous contacter',
  description: 'Une question, un problème de commande ou un retour ? Contactez le support TechPlay. Réponse sous 24 à 48 h ouvrées.',
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <main
      className="container-app mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="contact-title"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          Support
        </p>
        <h1
          id="contact-title"
          className="heading-page mt-2"
        >
          Nous contacter
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          Une question, un problème de commande ou un retour ? Nous sommes là pour vous répondre.
        </p>
      </header>

      <div className="space-y-6">
        {/* Primary contact block */}
        <section
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm"
          aria-labelledby="contact-email-heading"
        >
          <h2 id="contact-email-heading" className="heading-subsection">
            Écrire au support
          </h2>
          <p className="mt-2 text-[14px] text-token-text/75">
            Envoyez-nous un email à l&apos;adresse ci-dessous. Nous nous engageons à vous répondre sous 24 à 48 h ouvrées.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            {SUPPORT_EMAIL}
          </a>
        </section>

        {/* Reassurance strip */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">Réponse rapide</p>
              <p className="mt-0.5 text-[12px] text-token-text/70">Sous 24–48 h ouvrées</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">Données protégées</p>
              <p className="mt-0.5 text-[12px] text-token-text/70">Vos infos restent confidentielles</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--text))]">Équipe dédiée</p>
              <p className="mt-0.5 text-[12px] text-token-text/70">Support client TechPlay</p>
            </div>
          </div>
        </div>

        {/* Secondary: FAQ / Home */}
        <section className="rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/40 px-5 py-5 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-token-text/60">
            En attendant
          </h2>
          <p className="mt-2 text-[14px] text-token-text/75">
            Consultez la <Link href="/#faq" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline" prefetch={false}>FAQ</Link> pour les questions fréquentes, ou retournez à l&apos;accueil pour continuer vos achats.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/#faq"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              Voir la FAQ
            </Link>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
