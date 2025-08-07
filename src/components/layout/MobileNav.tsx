'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/useCart'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { cart } = useCart()
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0)

  // Gestion ESC + scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu mobile"
        className="md:hidden p-2 text-2xl focus:outline-none"
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-white dark:bg-black z-[9999] flex flex-col items-center justify-center py-6 px-4 space-y-6 shadow-lg animate-fade-in transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col gap-6 text-xl text-gray-800 dark:text-gray-100 text-center" aria-label="Navigation mobile">
            <Link href="/" onClick={() => setOpen(false)} className="hover:text-accent">
              Accueil
            </Link>
            <Link href="/produit" onClick={() => setOpen(false)} className="hover:text-accent">
              Produits
            </Link>
            <Link href="/pack" onClick={() => setOpen(false)} className="hover:text-accent">
              Packs
            </Link>
            <Link href="/wishlist" onClick={() => setOpen(false)} className="hover:text-accent">
              Wishlist
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="hover:text-accent">
              Blog
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-accent">
              Contact
            </Link>

            {/* Promo du jour */}
            <Link
              href="/promo"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              🎁 Promo du jour
            </Link>

            {/* Panier */}
            <Link
              href="/commande"
              onClick={() => setOpen(false)}
              className="relative inline-flex items-center justify-center text-xl text-gray-800 dark:text-white"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          <button
            onClick={() => setOpen(false)}
            className="text-sm mt-6 text-gray-500 dark:text-gray-400 hover:underline focus:outline-none"
            aria-label="Fermer le menu mobile"
          >
            ✕ Fermer
          </button>
        </div>
      )}
    </>
  )
}
