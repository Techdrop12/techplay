// src/lib/data.ts
import { connectToDatabase } from './db'
import Product from '@/models/Product'
import Pack from '@/models/Pack'
import Blog from '@/models/Blog'

import type { Product as ProductType, Pack as PackType } from '@/types/product'
import type { BlogPost } from '@/types/blog'

/* ==================== Accès simples ==================== */

export async function getBestProducts(): Promise<ProductType[]> {
  await connectToDatabase()
  return (await Product.find({ featured: true })
    .limit(8)
    .select('_id slug title price image gallery rating reviewsCount stock category brand sku')
    .lean()) as unknown as ProductType[]
}

export async function getAllProducts(): Promise<ProductType[]> {
  await connectToDatabase()
  return (await Product.find({})
    .select('_id slug title price image gallery rating reviewsCount stock category brand sku')
    .lean()) as unknown as ProductType[]
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  await connectToDatabase()
  const product = await Product.findOne({ slug }).lean()
  return product ? JSON.parse(JSON.stringify(product)) : null
}

export async function getRecommendedPacks(): Promise<PackType[]> {
  await connectToDatabase()
  return (await Pack.find({ recommended: true }).limit(6).lean()) as unknown as PackType[]
}

export async function getPackBySlug(slug: string): Promise<PackType | null> {
  await connectToDatabase()
  const pack = await Pack.findOne({ slug }).lean()
  return pack ? JSON.parse(JSON.stringify(pack)) : null
}

export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  await connectToDatabase()
  return (await Blog.find({}).sort({ createdAt: -1 }).limit(10).lean()) as unknown as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await connectToDatabase()
  const post = await Blog.findOne({ slug }).lean()
  return post ? JSON.parse(JSON.stringify(post)) : null
}

/* ==================== /products : pagination + tri DB ==================== */

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'

type GetProductsPageInput = {
  q?: string
  min?: number
  max?: number
  sort?: SortKey
  page?: number
  pageSize?: number
  /** filtre catégorie (insensible à la casse + alias FR/EN) */
  category?: string | null
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Alias FR/EN robustes pour les catégories dataset */
const CATEGORY_ALIASES: Record<string, string[]> = {
  casques: ['casques', 'casque', 'headphones', 'headset', 'écouteurs', 'earbuds', 'audio headset'],
  claviers: ['claviers', 'clavier', 'keyboards', 'keyboard', 'mechanical keyboard', 'mech'],
  souris: ['souris', 'mouse', 'mice', 'gaming mouse', 'wireless mouse'],
  webcams: ['webcam', 'webcams', 'camera', 'pc camera'],
  batteries: ['batteries', 'battery', 'power bank', 'chargeur', 'charger', 'usb-c charger', 'hub'],
  audio: ['audio', 'speakers', 'speaker', 'enceinte', 'dac', 'soundbar'],
  stockage: ['stockage', 'storage', 'ssd', 'carte', 'memory card', 'sd card', 'usb', 'hdd', 'disque'],
  ecrans: ['ecrans', 'écrans', 'monitor', 'monitors', 'screen', 'display'],
}

/** Construit un RegExp “^alias1|alias2|…$” insensible à la casse */
function buildCategoryRegex(input?: string | null): RegExp | null {
  if (!input) return null
  const key = String(input).trim().toLowerCase()
  const list = CATEGORY_ALIASES[key] || [key]
  const alts = Array.from(new Set(list.filter(Boolean).map((s) => s.trim())))
  return alts.length ? new RegExp(`^(${alts.map(escapeRegex).join('|')})$`, 'i') : null
}

/**
 * Normalise le prix:
 * - `currentPrice` = promo si active sinon `price`
 * - `oldPriceOut` = ancien prix si promo active
 * Tous les filtres min/max et les stats se basent sur `currentPrice` ✅
 * Le tri "promo" utilise le pourcentage de remise calculé côté DB.
 */
export async function getProductsPage({
  q,
  min,
  max,
  sort = 'new',
  page = 1,
  pageSize = 24,
  category = null,
}: GetProductsPageInput) {
  await connectToDatabase()

  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.min(96, Math.max(1, Number(pageSize) || 24))
  const skip = (safePage - 1) * safeSize

  // Match texte (titre/desc/marque/catégorie)
  const textMatch: Record<string, any> = {}
  if (q && q.trim()) {
    const rx = new RegExp(q.trim(), 'i')
    textMatch.$or = [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }]
  }

  // Catégorie (alias FR/EN) → RegExp alternatives
  const catRegex = buildCategoryRegex(category || undefined)
  const categoryMatch = catRegex ? { category: { $regex: catRegex } } : null

  const now = new Date()

  // Stages communs: calcul promo + prix courant + % remise
  const promoAddFields = [
    {
      $addFields: {
        isPromoActive: {
          $and: [
            { $ifNull: ['$promo.price', false] },
            { $lt: ['$promo.price', '$price'] },
            { $or: [{ $eq: ['$promo.startDate', null] }, { $lte: ['$promo.startDate', now] }] },
            { $or: [{ $eq: ['$promo.endDate', null] }, { $gte: ['$promo.endDate', now] }] },
          ],
        },
      },
    },
    {
      $addFields: {
        currentPrice: { $cond: ['$isPromoActive', '$promo.price', '$price'] },
        oldPriceOut: { $cond: ['$isPromoActive', '$price', null] },
      },
    },
    {
      $addFields: {
        discountPct: {
          $cond: [
            { $and: [{ $gt: ['$oldPriceOut', 0] }, { $lt: ['$currentPrice', '$oldPriceOut'] }] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $subtract: ['$oldPriceOut', '$currentPrice'] }, '$oldPriceOut'] },
                    100,
                  ],
                },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
  ]

  // Filtre min/max sur le PRIX COURANT (après promo)
  const priceMatch =
    typeof min === 'number' || typeof max === 'number'
      ? {
          $match: {
            currentPrice: {
              ...(typeof min === 'number' ? { $gte: min } : {}),
              ...(typeof max === 'number' ? { $lte: max } : {}),
            },
          },
        }
      : null

  // Tri
  const itemsSort =
    sort === 'promo'
      ? [{ $sort: { discountPct: -1, currentPrice: 1 } }]
      : sort === 'price_asc'
      ? [{ $sort: { currentPrice: 1 } }]
      : sort === 'price_desc'
      ? [{ $sort: { currentPrice: -1 } }]
      : sort === 'rating'
      ? [{ $sort: { rating: -1 } }]
      : [{ $sort: { createdAt: -1 } }]

  const pipeline: any[] = [
    { $match: textMatch },
    {
      $facet: {
        // Liste paginée (catégorie appliquée ici)
        items: [
          ...(categoryMatch ? [{ $match: categoryMatch }] : []),
          ...promoAddFields,
          ...(priceMatch ? [priceMatch] : []),
          ...itemsSort,
          { $skip: skip },
          { $limit: safeSize },
          {
            $project: {
              _id: 1,
              slug: 1,
              title: 1,
              price: '$currentPrice',
              oldPrice: '$oldPriceOut',
              image: 1,
              images: '$gallery',
              rating: 1,
              reviewsCount: 1,
              stock: 1,
              category: 1,
              brand: 1,
              sku: 1,
              discountPct: 1,
              createdAt: 1,
            },
          },
        ],

        // Total (avec catégorie)
        total: [
          ...(categoryMatch ? [{ $match: categoryMatch }] : []),
          ...promoAddFields,
          ...(priceMatch ? [priceMatch] : []),
          { $count: 'value' },
        ],

        // Comptages par catégorie (sans filtre de catégorie, mais avec q + min/max courants)
        categoryCounts: [
          ...promoAddFields,
          ...(priceMatch ? [priceMatch] : []),
          {
            $group: {
              _id: { $ifNull: ['$category', 'Autres'] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ],

        // Stats de prix courants (après promo)
        stats: [
          ...promoAddFields,
          ...(priceMatch ? [priceMatch] : []),
          { $group: { _id: null, min: { $min: '$currentPrice' }, max: { $max: '$currentPrice' } } },
        ],
      },
    },
  ]

  const agg = await Product.aggregate(pipeline)
  const facet = agg?.[0] || { items: [], total: [], categoryCounts: [], stats: [] }
  const items = (facet.items || []) as ProductType[]
  const total = Number(facet.total?.[0]?.value || 0)
  const pageCount = Math.max(1, Math.ceil(total / safeSize))

  const counts: Record<string, number> = {}
  for (const row of facet.categoryCounts || []) {
    if (row?._id != null) counts[String(row._id)] = Number(row.count || 0)
  }

  const priceRange =
    facet.stats?.[0] && Number.isFinite(facet.stats[0].min) && Number.isFinite(facet.stats[0].max)
      ? { min: Number(facet.stats[0].min), max: Number(facet.stats[0].max) }
      : undefined

  return {
    items,
    total,
    page: safePage,
    pageSize: safeSize,
    pageCount,
    categoryCounts: counts,
    priceRange,
  }
}
