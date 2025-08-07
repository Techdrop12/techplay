'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

export default function Header() {
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { cart } = useCart()

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
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0)

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[9999] bg-white dark:bg-black text-black dark:text-white px-3 py-1 rounded-md"
      >
        Aller au contenu principal
      </a>

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-black/80 shadow-sm transition-transform duration-300 border-b border-gray-200 dark:border-gray-800',
          hidden ? '-translate-y-full' : 'translate-y-0'
        )}
        role="banner"
        aria-label="En-tête du site"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link href="/" aria-label="Retour à l’accueil" className="flex items-center gap-3">
            <Logo className="h-10 w-auto" />
          </Link>

          {/* Navigation desktop */}
          <nav
            className="hidden md:flex gap-6 lg:gap-10 font-medium text-gray-800 dark:text-gray-100 tracking-tight"
            aria-label="Navigation principale"
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative transition-colors duration-200 group',
                  isActive(href)
                    ? 'text-accent font-bold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:rounded-full after:bg-accent'
                    : 'hover:text-accent focus-visible:text-accent'
                )}
              >
                {label}
                {!isActive(href) && (
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Promo */}
            <Link
              href="/promo"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold px-5 py-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/40 transition-all"
              aria-label="Voir la promotion du jour"
            >
              🎁 <span className="hidden sm:inline">Promo du jour</span>
            </Link>

            {/* Panier */}
            <Link
              href="/commande"
              className="relative text-gray-800 dark:text-white hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              aria-label="Voir le panier"
            >
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Menu mobile */}
          <MobileNav />
        </div>
      </header>
    </>
  )
}
