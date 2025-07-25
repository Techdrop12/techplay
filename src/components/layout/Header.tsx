'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'

export default function Header() {
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setHidden(currentY > lastScrollY && currentY > 80)
      setLastScrollY(currentY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const isActive = (href: string) => pathname === href

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/categorie/accessoires', label: 'Catégories' },
    { href: '/produit', label: 'Produits' },
    { href: '/pack', label: 'Packs' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/commande', label: 'Commande' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[9999] bg-white dark:bg-black text-black dark:text-white px-2 py-1 rounded"
      >
        Aller au contenu principal
      </a>

      <header
        className={cn(
          'fixed top-0 z-50 w-full backdrop-blur-md bg-gradient-to-b from-white/95 via-white/70 to-white/50 dark:from-black/95 dark:via-black/75 dark:to-black/50 transition-transform duration-300 shadow-lg border-b border-gray-200 dark:border-gray-800',
          hidden ? '-translate-y-full' : 'translate-y-0'
        )}
        role="banner"
        aria-label="En-tête du site TechPlay"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Retour à l’accueil" className="flex items-center gap-3">
            <Logo className="h-12 w-auto" />
          </Link>

          <nav
            className="hidden md:flex gap-8 text-base font-semibold tracking-wide"
            aria-label="Navigation principale"
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative text-gray-900 dark:text-gray-100 transition-colors group',
                  isActive(href)
                    ? 'font-extrabold text-accent after:absolute after:-bottom-1 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-accent'
                    : 'hover:text-accent focus-visible:text-accent'
                )}
              >
                {label}
                {/* Underline animation */}
                {!isActive(href) && (
                  <span className="absolute bottom-0 left-0 w-0 h-[3px] rounded-full bg-accent transition-[width] group-hover:w-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* CTA bouton visible sur desktop */}
          <div className="hidden md:block">
            <Link
              href="/promo"
              className="inline-block rounded-md bg-accent px-6 py-2 text-white font-bold tracking-wide shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent/60 transition-transform transform hover:scale-105 active:scale-95 animate-pulse"
              aria-label="Voir la promotion du jour"
            >
              Promo du jour
            </Link>
          </div>

          <MobileNav />
        </div>
      </header>
    </>
  )
}
