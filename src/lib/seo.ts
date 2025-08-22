// src/lib/seo.ts — Générateur de metadata typé Next (fix union 'type')
import type { Metadata } from 'next'

interface MetaProps {
  title: string
  description: string
  url: string // absolue ou relative
  image?: string
  /** On accepte 'product' côté API, mais on le mappe vers 'website' pour Next. */
  type?: 'website' | 'article' | 'product'
  locale?: 'fr_FR' | 'en_US'
  noindex?: boolean
}

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const abs = (u: string) => {
  try {
    return new URL(u).toString()
  } catch {
    return new URL(u.startsWith('/') ? u : `/${u}`, ORIGIN).toString()
  }
}

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

  // ✅ Next n’autorise que 'website' | 'article' → on mappe 'product' vers 'website'
  const ogType: 'website' | 'article' | undefined =
    type === 'product' ? 'website' : type

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: ogType,
      locale,
      url: canonical,
      siteName: 'TechPlay',
      images: [{ url: imageAbs }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageAbs],
    },
  }
}
