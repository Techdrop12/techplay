'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { cn } from '@/lib/utils'

export default function Header() {
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setHidden(currentScrollY > lastScrollY && currentScrollY > 80)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full bg-white/90 dark:bg-black/90 backdrop-blur transition-transform duration-300',
        hidden && '-translate-y-full'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/">Accueil</Link>
          <Link href="/categorie/accessoires">Catégories</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
