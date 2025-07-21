'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  // Fermer sur ESC et scroll lock
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
          <nav className="flex flex-col gap-4 text-xl text-gray-800 dark:text-gray-100 text-center" aria-label="Navigation mobile">
            {[
              { href: '/', label: 'Accueil' },
              { href: '/produit', label: 'Produits' },
              { href: '/pack', label: 'Packs' },
              { href: '/wishlist', label: 'Wishlist' },
              { href: '/commande', label: 'Commande' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:underline focus:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(false)}
            className="text-sm mt-4 text-gray-500 dark:text-gray-400 hover:underline focus:outline-none"
            aria-label="Fermer le menu mobile"
          >
            ✕ Fermer
          </button>
        </div>
      )}
    </>
  )
}
