// src/components/NotFound.tsx
'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef } from 'react'

import Link from '@/components/LocalizedLink'

export default function NotFound() {
  const t = useTranslations('not_found')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const attempted = useMemo(() => {
    const qs = searchParams?.toString()
    return qs ? `${pathname ?? '/' }?${qs}` : (pathname ?? '/')
  }, [pathname, searchParams])

  const h1Ref = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => { h1Ref.current?.focus() }, [])

  const popularLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Nos produits' },
    { href: '/categorie', label: 'Catégories' },
    { href: '/products/packs', label: 'Packs' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <section className="mt-8">
      <h2 ref={h1Ref} tabIndex={-1} className="sr-only">
        {t('details_heading')}
      </h2>

      <p className="mt-3 text-[13px] text-token-text/60">
        {t('path_requested')}
        <code className="ml-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-[12px]">
          {attempted}
        </code>
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
        aria-label={t('back_home')}
        >
          ← {t('back_home')}
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t('go_back')}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-[15px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] focus-visible:ring-offset-2"
        >
          ⟲ Page précédente
        </button>
      </div>

      <nav
        className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3"
        aria-label="Liens rapides"
      >
        {popularLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-[13px] font-medium transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <a
          href={`mailto:support@techplay.fr?subject=Lien brisé&body=URL introuvable : ${encodeURIComponent(attempted)}`}
          className="text-[12px] text-token-text/60 underline transition hover:text-[hsl(var(--text))]"
        >
          Signaler ce lien brisé
        </a>
      </div>
    </section>
  )
}
