// src/components/NotFound.tsx
'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'

import Link from '@/components/LocalizedLink'

export default function NotFound() {
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
    { href: '/categorie/accessoires', label: 'Catégories' },
    { href: '/products/packs', label: 'Packs' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <section className="mt-8">
      <h2 ref={h1Ref} tabIndex={-1} className="sr-only">
        Détails de la page introuvable
      </h2>

      <p className="mt-3 text-[13px] text-gray-500 dark:text-gray-400">
        Chemin demandé :
        <code className="ml-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-2 py-1 text-[12px]">
          {attempted}
        </code>
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-[15px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
        >
          ← Retour à l&apos;accueil
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3 text-[15px] font-semibold transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] focus-visible:ring-offset-2"
          aria-label="Revenir à la page précédente"
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
          href={`mailto:support@techplay.example.com?subject=Lien brisé&body=URL introuvable : ${encodeURIComponent(attempted)}`}
          className="text-[12px] text-gray-500 underline transition hover:text-gray-700 dark:hover:text-gray-300"
        >
          Signaler ce lien brisé
        </a>
      </div>
    </section>
  )
}
