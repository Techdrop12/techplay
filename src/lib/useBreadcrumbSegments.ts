'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

export type Locale = 'fr' | 'en'
export type BreadcrumbSegment = { label: string; href: string }

const LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    produit: 'Produit',
    produits: 'Produits',
    panier: 'Panier',
    wishlist: 'Favoris',
    blog: 'Blog',
    'a-propos': 'À propos',
    contact: 'Contact',
    commande: 'Commande',
    'mes-commandes': 'Mes commandes',
    success: 'Succès',
    admin: 'Admin',
    dashboard: 'Dashboard',
    categorie: 'Catégorie',
  },
  en: {
    produit: 'Product',
    produits: 'Products',
    panier: 'Cart',
    wishlist: 'Wishlist',
    blog: 'Blog',
    'a-propos': 'About',
    contact: 'Contact',
    commande: 'Order',
    'mes-commandes': 'My Orders',
    success: 'Success',
    admin: 'Admin',
    dashboard: 'Dashboard',
    categorie: 'Category',
  },
}

function detectLocaleFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'fr'
}

/** Humanise un segment (slug → Label Joli) si pas dans le dictionnaire. */
function prettify(seg: string): string {
  const s = decodeURIComponent(seg).replace(/-/g, ' ')
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Hook client pour générer les segments de breadcrumb.
 * - Ignore le préfixe de locale dans l’UI (expose /fr/… mais ne crée pas de “crumb” ‘fr’)
 * - Conserve la locale dans les href
 * - Traduit quelques segments courants (FR/EN), sinon prettify
 */
export default function useBreadcrumbSegments(): BreadcrumbSegment[] {
  const pathname = usePathname() || '/'

  return useMemo(() => {
    const locale: Locale = detectLocaleFromPath(pathname)
    const parts = pathname.split('/').filter(Boolean)

    // Base href garde la locale si présente
    const first = parts[0]
    const hasLocale = first === 'fr' || first === 'en'
    const baseParts = hasLocale ? [first] : []

    let acc: string[] = [...baseParts]
    const uiParts = hasLocale ? parts.slice(1) : parts

    const out: BreadcrumbSegment[] = uiParts.map((seg) => {
      acc.push(seg)
      const href = '/' + acc.join('/')
      const dict = LABELS[locale]
      const label = dict[seg] || prettify(seg)
      return { label, href }
    })

    return out
  }, [pathname])
}
