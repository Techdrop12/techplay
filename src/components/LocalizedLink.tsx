// src/components/LocalizedLink.tsx — FINAL (i18n-safe + absolus intacts)
'use client'

import NextLink, { type LinkProps } from 'next/link'
import type { UrlObject } from 'url'
import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'
import { forwardRef } from 'react'
import type React from 'react'

type Props = Omit<LinkProps, 'href'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string | UrlObject
    locale?: Locale
    /** Conserve le querystring courant (utile pour garder un tri/filtre) */
    keepQuery?: boolean
  }

/** Détecte toute URL absolue (http, https, mailto, tel, etc.) ou protocole relatif `//` */
function isAbsolute(href: string) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href)
}

function normalizeHref(
  href: string | UrlObject,
  locale?: Locale,
  keepQuery?: boolean
): string | UrlObject {
  const loc = locale ?? getCurrentLocale()

  if (typeof href === 'string') {
    // Laisse les URLs absolues et les schémas spéciaux intacts
    return isAbsolute(href) ? href : localizePath(href, loc, { keepQuery })
  }

  // UrlObject : on localise seulement si un pathname est défini & relatif
  const next: UrlObject = { ...href }
  const p = typeof href.pathname === 'string' ? href.pathname : undefined

  if (p && !isAbsolute(p)) {
    next.pathname = localizePath(p, loc, { keepQuery })
  }
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
