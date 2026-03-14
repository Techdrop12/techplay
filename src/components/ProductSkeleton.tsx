// src/components/ProductSkeleton.tsx — Premium skeleton (aligné sur ProductCard)
// - Aspect ratio, coins arrondis, bordure & ombres identiques
// - Emplacements pour badges, note, prix, tags & CTA flottants
// - A11y: pure déco → aria-hidden; possibilité d’annoncer via prop

'use client'

import React from 'react'

import { cn } from '@/lib/utils'

type Props = {
  className?: string
  /** Si true, ajoute un <p role="status"> lisible par les lecteurs d’écran */
  announce?: boolean
}

export default function ProductSkeleton({ className, announce = false }: Props) {
  return (
    <article
      aria-hidden={announce ? undefined : true}
      className={cn(
        'group relative rounded-2xl p-[1px] ring-conic shadow-[var(--shadow-sm)]',
        className
      )}
    >
      {/* Conteneur interne identique à ProductCard */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[inherit]',
            'bg-[hsl(var(--surface))]/90 supports-[backdrop-filter]:backdrop-blur',
            'border border-[hsl(var(--border))]'
          )}
        >
        {/* Media (même ratio 4/3) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[inherit]">
          {/* Fond shimmer */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[hsl(var(--surface-2))] to-[hsl(var(--surface))]" />

          {/* Badges (Nouveau / Best / -X%) placeholders */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex select-none flex-col gap-2">
            <span className="h-5 w-16 rounded-full bg-[hsl(var(--surface))]/90 shadow" />
            <span className="h-5 w-20 rounded-full bg-[hsl(var(--surface))]/90 shadow" />
            <span className="h-5 w-12 rounded-full bg-[hsl(var(--surface))]/90 shadow" />
          </div>

          {/* Note / rating pill */}
          <div className="absolute right-3 top-3 grid gap-1 text-right">
            <span className="h-6 w-14 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow backdrop-blur-sm" />
            <span className="h-3 w-16 rounded bg-[hsl(var(--surface-2))]" />
          </div>

          {/* CTA flottants (wishlist + add-to-cart) */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10">
            <span className="block h-9 w-28 rounded-lg bg-[hsl(var(--surface))]/90 shadow" />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 z-10">
            <span className="block h-9 w-9 rounded-full bg-[hsl(var(--surface))]/90 shadow" />
          </div>

          {/* Vignette subtile bas comme ProductCard */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-5">
          {/* Titre (2 lignes) */}
          <div className="space-y-2">
            <div className="h-4 w-[88%] rounded bg-[hsl(var(--surface-2))] animate-pulse" />
            <div className="h-4 w-[70%] rounded bg-[hsl(var(--surface-2))] animate-pulse" />
          </div>

          {/* Tags (fine ligne) */}
          <div className="mt-2 h-3 w-1/3 rounded bg-[hsl(var(--surface-2))]/80 animate-pulse" />

          {/* Prix + ancien prix + remise */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="h-6 w-24 rounded bg-[hsl(var(--surface-2))] animate-pulse" />
            <span className="h-4 w-16 rounded bg-[hsl(var(--surface-2))]/80 line-through animate-pulse" />
            <span className="h-4 w-10 rounded bg-[hsl(var(--accent)/0.2)] animate-pulse" />
          </div>

          {/* Badge livraison gratuite / microcopie */}
          <div className="mt-2 h-4 w-40 rounded bg-[hsl(var(--surface-2))]/80 animate-pulse" />
        </div>
      </div>

      {announce && (
        <p className="sr-only" role="status" aria-live="polite">
          Chargement du produit…
        </p>
      )}
    </article>
  )
}
