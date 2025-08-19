// src/components/NotFound.tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

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
    { href: '/produit', label: 'Nos produits' },
    { href: '/categorie/accessoires', label: 'Catégories' },
    { href: '/pack', label: 'Packs' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <section className="mt-8">
      <h2 ref={h1Ref} tabIndex={-1} className="sr-only">
        Détails de la page introuvable
      </h2>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Chemin demandé :
        <code className="ml-2 rounded bg-gray-100 dark:bg-zinc-900 px-2 py-1 text-[12px]">
          {attempted}
        </code>
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-semibold shadow hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/50"
        >
          ← Retour à l’accueil
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/30"
          aria-label="Revenir à la page précédente"
        >
          ⟲ Page précédente
        </button>
      </div>

      <nav
        className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3"
        aria-label="Liens rapides"
      >
        {popularLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <a
          href={`mailto:support@techplay.example.com?subject=Lien brisé&body=URL introuvable : ${encodeURIComponent(attempted)}`}
          className="text-xs text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Signaler ce lien brisé
        </a>
      </div>
    </section>
  )
}
