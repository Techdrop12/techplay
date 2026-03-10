'use client'

import NextLink, { type LinkProps } from 'next/link'
import { forwardRef } from 'react'

import type React from 'react'
import type { UrlObject } from 'url'

import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'

type NextHref = LinkProps['href']

type Props = Omit<LinkProps, 'href' | 'locale'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string | UrlObject
    locale?: Locale
    /** Conserve le querystring courant (utile pour garder un tri/filtre) */
    keepQuery?: boolean
    /** Conserve le hash (#section) courant si true */
    keepHash?: boolean
  }

/** URL absolue (http/https/mailto/tel/…) ou protocole relatif `//` */
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
    return isAbsolute(href)
      ? href
      : localizePath(href, resolvedLocale, { keepQuery, keepHash })
  }

  const nextHref: UrlObject = { ...href }
  const pathname =
    typeof href.pathname === 'string' && href.pathname.trim()
      ? href.pathname
      : undefined

  if (pathname && !isAbsolute(pathname)) {
    nextHref.pathname = localizePath(pathname, resolvedLocale, {
      keepQuery,
      keepHash,
    })
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