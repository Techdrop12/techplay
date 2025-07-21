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

    window.addEventListener('scroll', handleScroll)
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
    { href: '/contact', label: 'Contact' }
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
          'fixed top-0 z-50 w-full backdrop-blur bg-white/90 dark:bg-black/90 transition-transform duration-300 shadow-sm border-b border-gray-200 dark:border-gray-800',
          hidden && '-translate-y-full'
        )}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Retour à l’accueil" className="flex items-center gap-2">
            <Logo />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium" aria-label="Navigation principale">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  isActive(link.href)
                    ? 'font-semibold underline text-blue-600'
                    : 'text-gray-800 dark:text-gray-200 hover:underline transition-colors'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <MobileNav />
        </div>
      </header>
    </>
  )
}
