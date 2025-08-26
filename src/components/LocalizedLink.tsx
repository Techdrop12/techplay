'use client'

import NextLink, { type LinkProps } from 'next/link'
import type { UrlObject } from 'url'
import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'
import { forwardRef } from 'react'

type Props = Omit<LinkProps, 'href'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string | UrlObject
    locale?: Locale
    /** conserve le querystring courant (utile pour garder un tri/filtre) */
    keepQuery?: boolean
  }

function normalizeHref(
  href: string | UrlObject,
  locale?: Locale,
  keepQuery?: boolean
): string | UrlObject {
  const loc = locale ?? getCurrentLocale()
  if (typeof href === 'string') {
    return localizePath(href, loc, { keepQuery })
  }
  // UrlObject -> on localise le pathname si présent
  const next: UrlObject = { ...href }
  const p = typeof href.pathname === 'string' ? href.pathname : '/'
  next.pathname = localizePath(p, loc, { keepQuery })
  return next
}

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, locale, keepQuery = false, ...rest },
  ref
) {
  const finalHref = normalizeHref(href, locale, keepQuery)
  return <NextLink ref={ref} href={finalHref as any} {...rest} />
})

export default LocalizedLink
