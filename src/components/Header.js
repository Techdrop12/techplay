// src/components/Header.js
'use client'

import dynamic from 'next/dynamic'
import LocalizedLink from '@/components/LocalizedLink'

const CartIndicator = dynamic(() => import('./CartIndicator'), { ssr: false })
const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false })
const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), { ssr: false })

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 bg-black text-white dark:bg-zinc-900">
      {/* Logo : on l’enveloppe dans LocalizedLink pour que "/" devienne par ex. "/fr" ou "/en" */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <LocalizedLink href="/">
          <img
            src="/logo.png"
            alt="TechPlay logo"
            className="h-10"
            loading="lazy"
          />
        </LocalizedLink>
        <div className="sm:hidden mt-2">
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 items-center justify-center sm:justify-end mt-4 sm:mt-0 text-sm">
        {/* Indicateur du panier (client‐side) */}
        <CartIndicator />

        {/* Tous les liens passent désormais par LocalizedLink */}
        <LocalizedLink href="/wishlist" className="hover:underline text-white">
          💖 Wishlist
        </LocalizedLink>
        <LocalizedLink href="/blog" className="hover:underline text-white">
          📰 Blog
        </LocalizedLink>
        <LocalizedLink href="/mes-commandes" className="hover:underline text-white">
          📦 Mes commandes
        </LocalizedLink>
        <LocalizedLink href="/admin" className="hover:underline text-white">
          Admin
        </LocalizedLink>

        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}
