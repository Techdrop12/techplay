'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const CartIndicator = dynamic(() => import('./CartIndicator'), { ssr: false })
const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false })
const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), { ssr: false })

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 bg-black text-white dark:bg-zinc-900">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <Link href="/">
          <img src="/logo.png" alt="TechPlay logo" className="h-10" />
        </Link>
        <div className="sm:hidden mt-2">
          <LanguageSwitcher />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 items-center justify-center sm:justify-end mt-4 sm:mt-0 text-sm">
        <CartIndicator />
        <Link href="/wishlist" className="hover:underline text-white">💖 Wishlist</Link>
        <Link href="/blog" className="hover:underline text-white">📰 Blog</Link>
        <Link href="/mes-commandes" className="hover:underline text-white">📦 Mes commandes</Link>
        <Link href="/admin" className="hover:underline text-white">Admin</Link>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}
