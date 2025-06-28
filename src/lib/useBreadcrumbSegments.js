'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Génère dynamiquement les segments du fil d’Ariane (breadcrumb) selon le chemin et la locale.
 * Utilisé pour le SEO (JSON-LD), la navigation secondaire, les balises meta dynamiques, etc.
 */
export default function useBreadcrumbSegments() {
  const pathname = usePathname();
  const locale = useLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';

  const segments = pathname.split('/').filter(Boolean);

  let path = '';
  const translations = {
    fr: {
      produit: 'Produit',
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
    },
    en: {
      produit: 'Product',
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
    },
  };

  const breadcrumb = segments.map((seg) => {
    path += `/${seg}`;
    const label =
      translations[locale]?.[seg] ||
      decodeURIComponent(seg.replace(/-/g, ' '))
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label,
      url: `${siteUrl}${path}`,
    };
  });

  return breadcrumb;
}
