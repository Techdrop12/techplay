'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(!open)} className="md:hidden p-2">
        ☰
      </button>
      {open && (
        <nav className="fixed top-0 left-0 w-full bg-white z-50 flex flex-col items-center py-6 shadow-md space-y-4">
          <Link href="/">Accueil</Link>
          <Link href="/produit">Produits</Link>
          <Link href="/pack">Packs</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/commande">Commande</Link>
          <button onClick={() => setOpen(false)} className="text-sm text-gray-500 underline">
            Fermer
          </button>
        </nav>
      )}
    </>
  )
}
