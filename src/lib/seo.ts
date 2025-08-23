// src/lib/seo.ts — Générateur de metadata Next typé + hreflang + noindex
import type { Metadata } from 'next'

interface MetaProps {
  title: string
  description: string
  url: string // absolue ou relative
  image?: string
  /** Côté Next, seuls 'website' | 'article' existent; 'product' est mappé en 'website'. */
  type?: 'website' | 'article' | 'product'
  locale?: 'fr_FR' | 'en_US'
  noindex?: boolean
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TechPlay'
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@techplay'

const abs = (u: string) => {
  try {
    return new URL(u).toString()
  } catch {
    return new URL(u.startsWith('/') ? u : `/${u}`, ORIGIN).toString()
  }
}

const stripLocalePrefix = (pathname: string) => pathname.replace(/^\/(fr|en)(?=\/|$)/, '')

export function generateMeta({
  title,
  description,
  url,
  image = '/og-image.jpg',
  type = 'website',
  locale = 'fr_FR',
  noindex = false,
}: MetaProps): Metadata {
  const canonical = abs(url)
  const imageAbs = abs(image)

  // Next n’autorise que 'website' | 'article'
  const ogType: 'website' | 'article' | undefined = type === 'product' ? 'website' : type

  // Hreflang (alternates.languages)
  // On part du path relatif (sans host), puis on recompose /fr et /en.
  let pathname = '/'
  try {
    const u = new URL(canonical)
    pathname = u.pathname
  } catch {
    pathname = url.startsWith('/') ? url : `/${url}`
  }
  const pathNoLocale = stripLocalePrefix(pathname)
  const hrefFr = `/fr${pathNoLocale || '/'}`
  const hrefEn = `/en${pathNoLocale || '/'}`

  return {
    // Astuce: tu peux définir un template global dans layout.tsx
    title,
    description,
    metadataBase: new URL(ORIGIN),
    alternates: {
      canonical,
      languages: {
        'fr-FR': hrefFr,
        'en-US': hrefEn,
        'x-default': '/',
      },
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: ogType,
      locale,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: imageAbs }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageAbs],
      site: TWITTER_HANDLE,
    },
  }
}
