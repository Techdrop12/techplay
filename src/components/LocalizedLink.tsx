'use client'

import NextLink, { type LinkProps } from 'next/link'
import { forwardRef, type AnchorHTMLAttributes } from 'react'

import type { UrlObject } from 'url'

import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'

type NextHref = LinkProps['href']

type Props = Omit<LinkProps, 'href' | 'locale'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string | UrlObject
    locale?: Locale
    keepQuery?: boolean
    keepHash?: boolean
  }

function isAbsolute(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href)
}

function normalizeHref(
  href: string | UrlObject,
  locale?: Locale,
  keepQuery = false,
  keepHash = false
): NextHref {
  const resolvedLocale = locale ?? getCurrentLocale()

  if (typeof href === 'string') {
    if (isAbsolute(href) || href.startsWith('#')) return href
    return localizePath(href, resolvedLocale, { keepQuery, keepHash })
  }

  const nextHref: UrlObject = { ...href }

  if (typeof href.pathname === 'string' && href.pathname.trim() && !isAbsolute(href.pathname)) {
    const queryString =
      typeof href.search === 'string'
        ? href.search
        : href.query && Object.keys(href.query).length > 0
          ? ''
          : ''

    const hash =
      typeof href.hash === 'string' && href.hash.startsWith('#')
        ? href.hash
        : typeof href.hash === 'string' && href.hash
          ? `#${href.hash}`
          : ''

    nextHref.pathname = localizePath(href.pathname, resolvedLocale)
    if (queryString) nextHref.search = queryString
    if (hash) nextHref.hash = hash
  }

  return nextHref
}

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, locale, keepQuery = false, keepHash = false, ...rest },
  ref
) {
  const finalHref = normalizeHref(href, locale, keepQuery, keepHash)

  return <NextLink ref={ref} href={finalHref} {...rest} />
})

LocalizedLink.displayName = 'LocalizedLink'

export default LocalizedLink