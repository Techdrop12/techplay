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
  // ⚠️ utilisé ailleurs: on laisse simple, sans normalisation promo
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
}

/**
 * Normalise le prix selon ta structure:
 * - prix de base: `price`
 * - promo active: `promo.price` < price ET date ok
 * On expose au front:
 *   - `price`  = prix courant
 *   - `oldPrice` = ancien prix si promo, sinon null
 *   - `images` = `gallery` (ton schéma) pour matcher le front
 */
export async function getProductsPage({
  q,
  min,
  max,
  sort = 'new',
  page = 1,
  pageSize = 24,
}: GetProductsPageInput) {
  await connectToDatabase()

  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.min(96, Math.max(1, Number(pageSize) || 24))
  const skip = (safePage - 1) * safeSize

  const match: Record<string, any> = {}

  if (q && q.trim()) {
    const rx = new RegExp(q.trim(), 'i')
    match.$or = [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }]
  }

  if (typeof min === 'number' || typeof max === 'number') {
    match.price = {}
    if (typeof min === 'number') match.price.$gte = min
    if (typeof max === 'number') match.price.$lte = max
  }

  // Tri par défaut (sera sur prix courant/discountPct via pipeline pour certains cas)
  let fallbackSort: Record<string, 1 | -1>
  switch (sort) {
    case 'price_asc':
      fallbackSort = { price: 1 }
      break
    case 'price_desc':
      fallbackSort = { price: -1 }
      break
    case 'rating':
      fallbackSort = { rating: -1 }
      break
    case 'new':
      fallbackSort = { createdAt: -1 }
      break
    case 'promo':
      // géré dans pipeline par discountPct
      fallbackSort = { createdAt: -1 }
      break
    default:
      fallbackSort = { createdAt: -1 }
  }

  const now = new Date()

  const pipeline: any[] = [
    { $match: match },
    {
      $addFields: {
        // promo active si prix promo < prix et dates ok (dates facultatives)
        isPromoActive: {
          $and: [
            { $ifNull: ['$promo.price', false] },
            { $lt: ['$promo.price', '$price'] },
            {
              $or: [
                { $eq: ['$promo.startDate', null] },
                { $lte: ['$promo.startDate', now] },
              ],
            },
            {
              $or: [
                { $eq: ['$promo.endDate', null] },
                { $gte: ['$promo.endDate', now] },
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        currentPrice: { $cond: ['$isPromoActive', '$promo.price', '$price'] },
        oldPriceOut: {
          $cond: ['$isPromoActive', '$price', null],
        },
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
    {
      $facet: {
        items: [
          ...(sort === 'promo'
            ? [{ $sort: { discountPct: -1, currentPrice: 1 } }]
            : sort === 'price_asc'
            ? [{ $sort: { currentPrice: 1 } }]
            : sort === 'price_desc'
            ? [{ $sort: { currentPrice: -1 } }]
            : [{ $sort: fallbackSort }]),
          { $skip: skip },
          { $limit: safeSize },
          {
            $project: {
              _id: 1,
              slug: 1,
              title: 1,
              // normalisation pour le front
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
              // utile si tu veux afficher le % direct
              discountPct: 1,
              createdAt: 1,
            },
          },
        ],
        total: [{ $count: 'value' }],
      },
    },
  ]

  const agg = await Product.aggregate(pipeline)
  const facet = agg?.[0] || { items: [], total: [] }
  const items = (facet.items || []) as ProductType[]
  const total = Number(facet.total?.[0]?.value || 0)
  const pageCount = Math.max(1, Math.ceil(total / safeSize))

  return {
    items,
    total,
    page: safePage,
    pageSize: safeSize,
    pageCount,
  }
}
