'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

/* ---------- Types & Const ---------- */

export type NavLink = { href: string; label: string }

const DEFAULT_LINKS: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/categorie/accessoires', label: 'Catégories' },
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const SCROLL_HIDE_OFFSET = 80

export interface HeaderProps {
  /** Liens de navigation (par défaut : DEFAULT_LINKS) */
  links?: NavLink[]
  /** Masquer l’en-tête quand on scrolle vers le bas (respecte prefers-reduced-motion) */
  hideOnScroll?: boolean
  /** Fond plus transparent en haut de page, puis solide au scroll */
  transparentAtTop?: boolean
  /** Afficher l’input de recherche desktop */
  showSearch?: boolean
  /** Afficher le bouton “Offres” (promotions) */
  showOffersCta?: boolean
  /** URL du CTA promos (défaut: /produit?promo=1) */
  offersHref?: string
}

export default function Header({
  links = DEFAULT_LINKS,
  hideOnScroll = true,
  transparentAtTop = true,
  showSearch = true,
  showOffersCta = true,
  offersHref = '/produit?promo=1',
}: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  // 🛒 Compteur panier (sécurisé si Provider pas encore dispo)
  let cartCount = 0
  try {
    const { cart } = useCart()
    cartCount = useMemo(
      () => (Array.isArray(cart) ? cart.reduce((t, it: any) => t + Math.max(1, Number(it?.quantity || 1)), 0) : 0),
      [cart]
    )
  } catch {
    cartCount = 0
  }

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Refs pour limiter les re-renders au scroll
  const lastY = useRef(0)
  const ticking = useRef(false)
  const reducedMotion = useRef(false)

  // Respecte prefers-reduced-motion (désactive hide-on-scroll si actif)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reducedMotion.current = !!mq?.matches
    const onChange = () => {
      reducedMotion.current = !!mq?.matches
      if (reducedMotion.current) setHidden(false)
    }
    mq?.addEventListener?.('change', onChange)
    return () => mq?.removeEventListener?.('change', onChange)
  }, [])

  // Hide-on-scroll + état "scrolled" (ombre/fond)
  useEffect(() => {
    if (!hideOnScroll) return
    const onScroll = () => {
      const y = window.scrollY
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(() => {
        setScrolled(y > 2)
        if (!reducedMotion.current) {
          setHidden(y > lastY.current && y > SCROLL_HIDE_OFFSET)
        } else {
          setHidden(false)
        }
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // état initial
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideOnScroll])

  const isActive = (href: string) => {
    if (!pathname) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  /* ---------- Recherche (desktop) ---------- */
  const [q, setQ] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const query = q.trim()
    if (!query) return
    router.push(`/recherche?q=${encodeURIComponent(query)}`)
  }

  // Raccourci ⌘K / Ctrl+K pour focus la recherche
  useEffect(() => {
    if (!showSearch) return
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const primary = isMac ? e.metaKey : e.ctrlKey
      if (primary && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSearch])

  return (
    <>
      {/* Skip link (clavier/lecteurs d’écran) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[9999] rounded-md bg-white px-3 py-1 text-sm font-semibold text-black ring-2 ring-offset-2 ring-black dark:bg-black dark:text-white dark:ring-white"
      >
        Aller au contenu principal
      </a>

      <header
        role="banner"
        aria-label="En-tête du site"
        data-hidden={hidden ? 'true' : 'false'}
        data-scrolled={scrolled ? 'true' : 'false'}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full',
          // Safe-area iOS
          'pb-[env(safe-area-inset-top,0)]',
          // Effet verre + saturation
          'supports-[backdrop-filter]:backdrop-blur-xl backdrop-saturate-150',
          // Bordure/ombres évolutives
          'border-b transition-all',
          // Transitions accessibles
          'motion-safe:duration-300 motion-safe:ease-out motion-safe:transition-transform motion-reduce:transition-none',
          scrolled || !transparentAtTop
            ? 'bg-white/95 shadow-md border-gray-200 dark:bg-black/80 dark:border-gray-800'
            : 'bg-white/70 border-transparent dark:bg-black/60',
          hideOnScroll && hidden ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="mx-auto max-w-7xl h-16 md:h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" aria-label="Retour à l’accueil" className="flex shrink-0 items-center gap-3">
            <Logo className="h-8 w-auto md:h-10" />
          </Link>

          {/* Navigation + Recherche (desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <nav
              className="flex gap-6 lg:gap-8 tracking-tight font-medium text-gray-800 dark:text-gray-100"
              aria-label="Navigation principale"
              role="navigation"
            >
              {links.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                      active
                        ? 'text-accent font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-accent'
                        : 'hover:text-accent focus-visible:text-accent'
                    )}
                  >
                    {label}
                    {!active && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Recherche rapide */}
            {showSearch && (
              <form
                onSubmit={submitSearch}
                role="search"
                aria-label="Rechercher des produits"
                className="hidden lg:flex items-center gap-2 rounded-xl border border-gray-300/80 dark:border-zinc-700/70 bg-white/80 dark:bg-zinc-900/70 px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-accent"
              >
                <span aria-hidden className="text-lg">🔎</span>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Rechercher… (⌘/Ctrl K)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="rounded-lg px-2 py-1 text-xs font-semibold bg-accent text-white hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label="Lancer la recherche"
                >
                  OK
                </button>
              </form>
            )}
          </div>

          {/* Actions droites (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {showOffersCta && (
              <Link
                href={offersHref}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-5 py-2 font-semibold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
                aria-label="Voir les offres en cours"
              >
                🎁 <span className="hidden sm:inline">Offres</span>
              </Link>
            )}

            {/* Panier */}
            <div className="relative">
              <Link
                href="/commande"
                prefetch={false}
                className="relative text-gray-800 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-white"
                aria-label={
                  cartCount > 0
                    ? `Voir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`
                    : 'Voir le panier'
                }
              >
                <span className="sr-only">Panier</span>
                <span className="text-2xl" aria-hidden="true">🛒</span>
              </Link>

              {/* Compteur panier (live region) */}
              <div aria-live="polite" aria-atomic="true" className="absolute -top-2 -right-2">
                {cartCount > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm animate-[pulse_2s_ease-in-out_infinite]">
                    <span className="sr-only">Articles dans le panier&nbsp;:</span>
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu / actions mobile */}
          <MobileNav />
        </div>

        {/* Liseré dégradé fin (finesse visuelle) */}
        <div aria-hidden="true" className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </header>
    </>
  )
}
