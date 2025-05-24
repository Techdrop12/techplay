'use client'

import Link from 'next/link'
import { useCart } from '../context/cartContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/context/context/themeContext' // ✅ Correction chemin

export default function Header() {
  const { cart } = useCart()
  const t = useTranslations()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const { theme, toggleTheme } = useTheme()

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
        <Link href="/panier" className="relative">
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
              {totalItems}
            </span>
          )}
        </Link>
        <Link href="/wishlist" className="hover:underline text-white">💖 Wishlist</Link>
        <Link href="/blog" className="hover:underline text-white">📰 Blog</Link>
        <Link href="/mes-commandes" className="hover:underline text-white">📦 Mes commandes</Link>
        <Link href="/admin" className="hover:underline text-white">{t('admin.dashboard')}</Link>
        <div className="hidden sm:block"><LanguageSwitcher /></div>

        <button
          onClick={toggleTheme}
          className="border rounded px-2 py-1 bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
        </button>
      </nav>
    </header>
  )
}
