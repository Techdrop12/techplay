'use client'

import Link, { type LinkProps } from 'next/link'
import type { UrlObject } from 'url'
import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'
import { forwardRef } from 'react'

type Props = Omit<LinkProps, 'href'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string | UrlObject
    locale?: Locale
    keepQuery?: boolean
  }

/** Link qui ajoute automatiquement le préfixe de langue (sauf fr). */
const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, locale, keepQuery = false, ...rest },
  ref
) {
  if (typeof href !== 'string') {
    // Si objet Next Url, on ne modifie pas (cas rare) → passe direct
    return <Link ref={ref} href={href} {...rest} />
  }
  const loc = locale ?? getCurrentLocale()
  const finalHref = localizePath(href, loc, { keepQuery })
  return <Link ref={ref} href={finalHref} {...rest} />
})

export default LocalizedLink
