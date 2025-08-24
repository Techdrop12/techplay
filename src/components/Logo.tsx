// src/components/Logo.tsx — auto light/dark via /public + fallback inline
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useId } from 'react'

interface LogoProps {
  className?: string
  withText?: boolean
  textClassName?: string
  ariaLabel?: string
  /** Si fourni, le logo devient un lien (ex: "/") — attention, pas i18n-aware */
  href?: string
  /** Chemins /public — si absents, fallback inline SVG */
  srcLight?: string  // ex: '/logo.svg'
  srcDark?: string   // ex: '/logo-dark.svg'
  /** Forcer l’inline même si srcLight/srcDark fournis */
  forceInline?: boolean
}

export default function Logo({
  className = 'h-10 md:h-12',
  withText = true,
  textClassName = 'text-xl sm:text-2xl font-bold tracking-tight text-token-text',
  ariaLabel = 'TechPlay',
  href,
  srcLight = '/logo.svg',
  srcDark,
  forceInline = false,
}: LogoProps) {
  // id unique pour éviter les collisions <defs> quand le logo apparaît plusieurs fois
  const uid = useId().replace(/[:]/g, '')
  const gradId = `tp_g_${uid}`

  const ImgVariant = () => {
    // Si on force l’inline, ou si on n’a pas de srcLight, on dessine le logo vectoriel interne
    if (forceInline || !srcLight) {
      return (
        <svg
          viewBox="0 0 48 48"
          className="h-full w-auto select-none"
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--accent))" />
              <stop offset="1" stopColor="hsl(var(--accent-600))" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradId})`} />
          <path
            d="M14 31.5V16.8h6.9c3.1 0 4.9 1.7 4.9 4 0 1.6-.9 3-2.6 3.6L30.9 31.5h-4.6l-6.1-6H18v6h-4Zm4-9.7h2.5c1.4 0 2.3-.6 2.3-1.9s-.9-1.9-2.3-1.9H18v3.8Z"
            fill="#fff"
            opacity=".96"
          />
        </svg>
      )
    }

    // Sinon : on charge les fichiers /public
    const darkSrc = srcDark || srcLight
    return (
      <>
        {/* version claire */}
        <img
          src={srcLight}
          alt=""
          className="h-full w-auto select-none dark:hidden"
          decoding="async"
          loading="eager"
          fetchPriority="low"
        />
        {/* version sombre (si non présent, on retombe sur le même fichier via darkSrc) */}
        <img
          src={darkSrc}
          alt=""
          className="hidden h-full w-auto select-none dark:inline"
          decoding="async"
          loading="eager"
          fetchPriority="low"
        />
      </>
    )
  }

  const content = (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ImgVariant />
      {withText && <span className={textClassName}>TechPlay</span>}
    </div>
  )

  // Optionnel : rendre le logo cliquable localement (non-localisé)
  return href ? (
    <Link href={href} prefetch={false} aria-label={ariaLabel} className="inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  )
}
