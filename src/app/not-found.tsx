// src/app/not-found.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import NotFoundClient from '@/components/NotFound';

export const metadata: Metadata = {
  title: '404 – Page introuvable | TechPlay',
  description:
    "Désolé, cette page n'existe pas ou a été déplacée. Retrouvez nos catégories ou retournez à l'accueil.",
  robots: { index: false, follow: false },
  alternates: { canonical: '/404' },
  openGraph: {
    title: '404 – Page introuvable | TechPlay',
    description:
      "Cette page n'existe pas. Recherchez un produit ou revenez à l'accueil.",
    type: 'website',
  },
};

export default function NotFoundPage() {
  return (
    <main
      id="main"
      className="max-w-5xl mx-auto px-4 pt-32 pb-24 text-center"
      aria-labelledby="nf-title"
      role="main"
    >
      <h1
        id="nf-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light"
      >
        404 – Page introuvable
      </h1>

      <p className="mt-4 text-muted-foreground">
        Désolé, cette page n’existe pas ou a été déplacée.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-white font-semibold shadow hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/50"
          aria-label="Retour à l’accueil"
        >
          ← Retour à l’accueil
        </Link>
        <Link
          href="/produit"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/30"
          aria-label="Voir nos produits"
        >
          Voir nos produits
        </Link>
      </div>

      {/* Le composant client (hooks de navigation) est wrap sous Suspense */}
      <Suspense fallback={<p className="mt-10 text-sm text-gray-500">Chargement…</p>}>
        <NotFoundClient />
      </Suspense>
    </main>
  );
}
