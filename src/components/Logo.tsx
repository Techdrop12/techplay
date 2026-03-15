'use client'

import NextLink from 'next/link'
import { useId } from 'react'

import LocalizedLink from '@/components/LocalizedLink'
import { type Locale } from '@/lib/i18n-routing'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  withText?: boolean
  textClassName?: string
  ariaLabel?: string
  href?: string
  localized?: boolean
  locale?: Locale
  srcLight?: string
  srcDark?: string
  forceInline?: boolean
  priority?: boolean
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
  srcDark = '/logo-dark.svg',
  forceInline = false,
  priority = true,
}: LogoProps) {
  const uid = useId().replace(/[:]/g, '')
  const gradId = `tp_g_${uid}`

  const InlineMark = () => (
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
      <path
        d="M14 31.5V16.8h6.8c3.2 0 5 1.7 5 4 0 1.8-1 3.1-2.7 3.7l6.7 7h-4.7l-6.1-6H18v6h-4Zm4-9.8h2.5c1.5 0 2.4-.6 2.4-1.9 0-1.3-.9-1.9-2.4-1.9H18v3.8Z"
        fill="#fff"
        opacity=".96"
      />
      <path d="M28 18.5 34.5 22 28 25.5v-7Z" fill="#fff" opacity=".9" />
    </svg>
  )

  const ImageMark = () => {
    if (forceInline || !srcLight) {
      return <InlineMark />
    }

    const darkSource = srcDark || srcLight

    const imgAlt = withText ? '' : ariaLabel
    return (
      <span className="relative inline-flex h-full w-auto items-center">
        <img
          src={srcLight}
          alt={imgAlt}
          {...(withText ? { 'aria-hidden': true } : {})}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="h-full w-auto select-none transition-transform duration-200 group-hover:scale-[1.02] dark:hidden"
        />
        <img
          src={darkSource}
          alt={imgAlt}
          {...(withText ? { 'aria-hidden': true } : {})}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="hidden h-full w-auto select-none transition-transform duration-200 group-hover:scale-[1.02] dark:block"
        />
      </span>
    )
  }

  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <ImageMark />
      {withText ? <span className={textClassName}>TechPlay</span> : null}
    </span>
  )

  if (!href) {
    return (
      <span className="inline-flex items-center" role="img" aria-label={ariaLabel}>
        {content}
      </span>
    )
  }

  if (localized) {
    return (
      <LocalizedLink
        href={href}
        locale={locale}
        prefetch={false}
        aria-label={ariaLabel}
        className="group inline-flex items-center"
      >
        {content}
      </LocalizedLink>
    )
  }

  return (
    <NextLink
      href={href}
      prefetch={false}
      aria-label={ariaLabel}
      className="group inline-flex items-center"
    >
      {content}
    </NextLink>
  )
}