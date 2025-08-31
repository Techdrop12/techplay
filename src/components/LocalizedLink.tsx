// src/components/LocalizedLink.tsx — i18n-safe (string | UrlObject) + absolus intacts + rel sécurisé
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
  // - //example.com
  // - https://, http://, mailto:, tel:, etc.
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href)
}

function normalizeHref(
  href: string | UrlObject,
  locale?: Locale,
  keepQuery?: boolean
): string | UrlObject {
  const loc = locale ?? getCurrentLocale()

  if (typeof href === 'string') {
    return isAbsolute(href) ? href : localizePath(href, loc, { keepQuery })
  }

  // UrlObject: on ne touche que pathname si relative
  const next: UrlObject = { ...href }
  const p = typeof href.pathname === 'string' ? href.pathname : undefined
  if (p && !isAbsolute(p)) next.pathname = localizePath(p, loc, { keepQuery })
  return next
}

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, locale, keepQuery = false, target, rel, ...rest },
  ref
) {
  const finalHref = normalizeHref(href, locale, keepQuery)

  // Sécurité pour les liens externes en target=_blank (noopener/noreferrer)
  const isExt =
    (typeof finalHref === 'string' && isAbsolute(finalHref)) ||
    (typeof finalHref !== 'string' && typeof finalHref.pathname === 'string' && isAbsolute(finalHref.pathname!))
  const safeRel = target === '_blank' && isExt ? (rel ? `${rel} noopener noreferrer` : 'noopener noreferrer') : rel

  return <NextLink ref={ref} href={finalHref as any} target={target} rel={safeRel} {...rest} />
})

export default LocalizedLink
