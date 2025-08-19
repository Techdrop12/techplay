// src/components/NotFound.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function NotFound() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL complète tentée (jolie à afficher)
  const attempted = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname || '/';
  }, [pathname, searchParams]);

  const popularLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/produit', label: 'Nos produits' },
    { href: '/categorie/accessoires', label: 'Catégories' },
    { href: '/pack', label: 'Packs' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <section
      className="mt-10 mx-auto max-w-4xl text-center"
      aria-label="Suggestions suite à une erreur 404"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Chemin demandé :
        <code className="ml-2 rounded bg-gray-100 dark:bg-zinc-900 px-2 py-1 text-[12px]">
          {attempted}
        </code>
      </p>

      {/* Liens utiles */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {popularLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Action secondaire : signaler un lien brisé (mailto simple) */}
      <div className="mt-8">
        <a
          href={`mailto:support@techplay.example.com?subject=Lien brisé&body=URL introuvable : ${encodeURIComponent(
            attempted || '/'
          )}`}
          className="text-xs text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Signaler ce lien brisé
        </a>
      </div>
    </section>
  );
}
