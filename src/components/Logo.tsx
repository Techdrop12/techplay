// src/components/Logo.tsx — logo premium (dark/light <picture>, fallback inline, i18n-ready)
'use client'

import NextLink from 'next/link'
import LocalizedLink from '@/components/LocalizedLink'
import { cn } from '@/lib/utils'
import { useId } from 'react'
import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'

interface LogoProps {
  className?: string
  withText?: boolean
  textClassName?: string
  ariaLabel?: string
  /** Si fourni, le logo devient un lien */
  href?: string
  /** Active la localisation du lien (par défaut: true) */
  localized?: boolean
  /** Forcer la locale (sinon auto) */
  locale?: Locale
  /** Chemins /public — si absents, fallback inline SVG */
  srcLight?: string  // ex: '/logo.svg'
  srcDark?: string   // ex: '/logo-dark.svg'
  /** Forcer l’inline même si srcLight/srcDark fournis */
  forceInline?: boolean
}

export default function Logo({
  className = 'h-10 md:h-12',
  withText = true,
  textClassName = 'text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(120deg,hsl(var(--accent)),hsl(var(--accent-700)))]',
  ariaLabel = 'TechPlay',
  href,
  localized = true,
  locale,
  srcLight = '/logo.svg',
  srcDark,
  forceInline = false,
}: LogoProps) {
  // id unique pour éviter les collisions <defs> quand le logo apparaît plusieurs fois
  const uid = useId().replace(/[:]/g, '')
  const gradId = `tp_g_${uid}`

  const Mark = () => {
    if (forceInline || !srcLight) {
      // Fallback inline premium (gradient + triangle “play” + monogramme TP)
      return (
        <svg
          viewBox="0 0 48 48"
          className="h-full w-auto select-none transition-transform duration-200 group-hover:scale-[1.02]"
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
          {/* Monogramme TP stylisé */}
          <path
            d="M14 31.5V16.8h6.8c3.2 0 5 1.7 5 4 0 1.8-1 3.1-2.7 3.7l6.7 7h-4.7l-6.1-6H18v6h-4Zm4-9.8h2.5c1.5 0 2.4-.6 2.4-1.9 0-1.3-.9-1.9-2.4-1.9H18v3.8Z"
            fill="#fff"
            opacity=".96"
          />
          {/* Triangle "play" subtil en surimpression */}
          <path d="M28 18.5 34.5 22 28 25.5v-7Z" fill="#fff" opacity=".9" />
        </svg>
      )
    }

    const darkSrc = srcDark || srcLight
    return (
      <picture>
        {/* Dark mode (media) */}
        <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />
        {/* Light fallback */}
        <img
          src={srcLight}
          alt=""
          className="h-full w-auto select-none transition-transform duration-200 group-hover:scale-[1.02]"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
      </picture>
    )
  }

  const content = (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <Mark />
      {withText && <span className={textClassName}>TechPlay</span>}
    </div>
  )

  // Pas de lien demandé → juste le contenu
  if (!href) return content

  // Lien localisé par défaut
  if (localized) {
    const loc = locale ?? getCurrentLocale()
    const to = localizePath(href, loc)
    return (
      <LocalizedLink
        href={to}
        prefetch={false}
        aria-label={ariaLabel}
        className="inline-flex items-center group"
      >
        {content}
      </LocalizedLink>
    )
  }

  // Lien simple non localisé
  return (
    <NextLink
      href={href}
      prefetch={false}
      aria-label={ariaLabel}
      className="inline-flex items-center group"
    >
      {content}
    </NextLink>
  )
}
