// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

// (facultatif) switcher langues si tu le réactives plus tard
// import LanguageSwitcher from '@/components/LanguageSwitcher'

type NavLink = { href: string; label: string }

const LINKS: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/categorie/accessoires', label: 'Catégories' },
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const SCROLL_HIDE_OFFSET = 80

export default function Header() {
  const pathname = usePathname()

  // 🛒 Récupération “safe” du panier (si le Provider n’est pas encore monté côté client)
  let cartCount = 0
  try {
    const { cart } = useCart()
    cartCount = Array.isArray(cart) ? cart.reduce((t, it: any) => t + (it?.quantity || 1), 0) : 0
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
  }, [])

  const isActive = (href: string) => {
    if (!pathname) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

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
          // Effet verre + saturation
          'supports-[backdrop-filter]:backdrop-blur-md backdrop-saturate-150',
          // Bordure/ombres évolutives
          'border-b transition-all',
          // Transitions accessibles
          'motion-safe:duration-300 motion-safe:ease-out motion-safe:transition-transform motion-reduce:transition-none',
          scrolled
            ? 'bg-white/95 shadow-md border-gray-200 dark:bg-black/80 dark:border-gray-800'
            : 'bg-white/70 border-transparent dark:bg-black/60',
          hidden ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" aria-label="Retour à l’accueil" className="flex shrink-0 items-center gap-3">
            <Logo className="h-8 w-auto md:h-10" />
          </Link>

          {/* Navigation desktop */}
          <nav
            className="hidden md:flex gap-6 lg:gap-10 tracking-tight font-medium text-gray-800 dark:text-gray-100"
            aria-label="Navigation principale"
          >
            {LINKS.map(({ href, label }) => {
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

          {/* Actions droites (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Bouton promo (glow) */}
            <Link
              href="/promo"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-5 py-2 font-semibold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
              aria-label="Voir la promotion du jour"
            >
              🎁 <span className="hidden sm:inline">Promo du jour</span>
            </Link>

            {/* Langues (à réactiver au besoin) */}
            {/* <div className="hidden lg:block"><LanguageSwitcher /></div> */}

            {/* Panier */}
            <div className="relative">
              <Link
                href="/commande"
                prefetch={false}
                className="relative text-gray-800 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-white"
                aria-label={cartCount > 0 ? `Voir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})` : 'Voir le panier'}
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

          {/* Menu mobile */}
          <MobileNav />
        </div>

        {/* Liseré dégradé fin (finesse visuelle) */}
        <div aria-hidden="true" className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </header>
    </>
  )
}
