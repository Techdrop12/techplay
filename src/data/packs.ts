import type { Pack } from '@/types/product'

export type PackLite = Pick<
  Pack,
  '_id' | 'slug' | 'title' | 'description' | 'image' | 'price'
>

export const packs: Pack[] = [
  {
    _id: 'pack-starter',
    slug: 'starter',
    title: 'Pack Starter',
    description: 'Les essentiels à prix réduit',
    image: '/packs/starter.jpg',
    images: ['/packs/starter.jpg'],
    price: 29.99,
    items: [],
  },
  {
    _id: 'pack-premium',
    slug: 'premium',
    title: 'Pack Premium',
    description: 'Pour les pros du confort tech',
    image: '/packs/premium.jpg',
    images: ['/packs/premium.jpg'],
    price: 59.99,
    items: [],
  },
]

export const getPackBySlug = (slug: string): Pack | undefined =>
  packs.find((pack) => pack.slug === slug)