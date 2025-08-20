export type MetaDefaults = {
  title: string
  description: string
  image: string
  type: 'website' | 'article' | 'product'
  locale: string
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

export const defaultMeta: MetaDefaults = {
  title: 'TechPlay — Boutique high-tech',
  description: 'Découvrez les meilleurs gadgets et accessoires tech du moment.',
  image: '/og-image.jpg',
  type: 'website',
  locale: 'fr_FR',
  siteName: 'TechPlay',
  twitterCard: 'summary_large_image',
}

export function buildMeta(overrides: Partial<MetaDefaults> = {}): MetaDefaults {
  return { ...defaultMeta, ...overrides }
}
