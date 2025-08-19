// src/components/NotFound.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const attempted = useMemo(() => {
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    return `${pathname}${qs || ''}`;
  }, [pathname]);

  // Focus accessible sur le titre
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    h1Ref.current?.focus();
  }, []);

  const [copied, setCopied] = useState(false);
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof window !== 'undefined' ? window.location.href : attempted
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

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
    <main
      id="main"
      className="max-w-5xl mx-auto px-4 pt-32 pb-24 text-center"
      role="main"
      aria-labelledby="nf-title"
    >
      <h1
        id="nf-title"
        ref={h1Ref}
        tabIndex={-1}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light"
      >
        404 – Page introuvable
      </h1>

      <p className="mt-4 text-muted-foreground">
        Désolé, cette page n’existe pas ou a été déplacée.
      </p>

      {/* Chemin tenté (utile pour support) */}
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Chemin demandé :
        <code className="ml-2 rounded bg-gray-100 dark:bg-zinc-900 px-2 py-1 text-[12px]">
          {attempted}
        </code>
      </p>

      <div className="mt-3">
        <button
          type="button"
          onClick={copyUrl}
          className="text-xs rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-live="polite"
        >
          {copied ? 'Copié ✓' : 'Copier l’URL'}
        </button>
      </div>

      {/* CTA principaux */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-semibold shadow hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/50"
          aria-label="Retour à l’accueil"
        >
          ← Retour à l’accueil
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/30"
          aria-label="Revenir à la page précédente"
        >
          ⟲ Page précédente
        </button>
      </div>

      {/* Liens utiles */}
      <div
        className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3"
        role="navigation"
        aria-label="Liens rapides"
      >
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

      {/* Action secondaire : signaler un lien brisé */}
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
    </main>
  );
}
