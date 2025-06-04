// src/components/LocalizedLink.js
'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'

export default function LocalizedLink({ href, children, ...props }) {
  // Récupère la locale courante ("fr" ou "en")
  const locale = useLocale()

  // S’assurer que href commence par "/"
  const cleaned = href.startsWith('/') ? href : '/' + href

  // On préfixe par la locale
  const localizedHref = `/${locale}${cleaned}`

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  )
}
