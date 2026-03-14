import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Espace client – TechPlay',
  description: 'Accédez à vos commandes, suivez vos livraisons et gérez votre compte TechPlay.',
  robots: { index: false, follow: false },
}

const LINKS = [
  {
    href: '/account/mes-commandes',
    title: 'Mes commandes',
    description: 'Historique, suivi et détails de vos commandes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: '/contact',
    title: 'Nous contacter',
    description: 'Support, SAV et questions : réponses sous 24 à 48 h.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
] as const

export default async function AccountPage() {
  const session = await getSession()
  const isLoggedIn = Boolean(session?.user?.email?.trim())

  return (
    <main
      className="container-app mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="account-title"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          Mon compte
        </p>
        <h1 id="account-title" className="heading-page mt-2">
          Espace client
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          {isLoggedIn
            ? 'Accédez à vos commandes et au support depuis cette page.'
            : 'Connectez-vous pour accéder à l’historique de vos commandes et à votre espace.'}
        </p>
      </header>

      <div className="space-y-6">
        {!isLoggedIn && (
          <section
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm text-center"
            aria-labelledby="login-cta-heading"
          >
            <h2 id="login-cta-heading" className="heading-subsection">
              Connexion
            </h2>
            <p className="mt-2 text-[14px] text-token-text/75">
              Connectez-vous pour voir vos commandes et gérer votre compte.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              Se connecter
            </Link>
          </section>
        )}

        <section
          className="rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/40 px-5 py-5 sm:px-6"
          aria-labelledby="account-links-heading"
        >
          <h2 id="account-links-heading" className="text-sm font-semibold uppercase tracking-wider text-token-text/60">
            Accès rapides
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2" role="list">
            {LINKS.map(({ href, title, description, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                    {icon}
                  </span>
                  <div className="min-w-0 text-left">
                    <span className="font-semibold text-[hsl(var(--text))]">{title}</span>
                    <p className="mt-0.5 text-[13px] text-token-text/70">{description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
