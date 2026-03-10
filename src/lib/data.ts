// src/lib/data.ts
import { connectToDatabase } from './db'

import type { BlogPost } from '@/types/blog'
import type { Product as ProductType, Pack as PackType } from '@/types/product'
import type { PipelineStage } from 'mongoose'

import Blog from '@/models/Blog'
import Pack from '@/models/Pack'
import Product from '@/models/Product'

/* ==================== Helpers ==================== */

function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/* ==================== Accès simples ==================== */

export async function getBestProducts(): Promise<ProductType[]> {
  await connectToDatabase()

  const docs = await Product.find({ featured: true })
    .limit(8)
    .select('_id slug title price image gallery rating reviewsCount stock category brand sku')
    .lean()
    .exec()

  return toPlain<ProductType[]>(docs)
}

export async function getAllProducts(): Promise<ProductType[]> {
  await connectToDatabase()

  const docs = await Product.find({})
    .select('_id slug title price image gallery rating reviewsCount stock category brand sku')
    .lean()
    .exec()

  return toPlain<ProductType[]>(docs)
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  await connectToDatabase()

  const product = await Product.findOne({ slug }).lean().exec()
  return product ? toPlain<ProductType>(product) : null
}

export async function getRecommendedPacks(): Promise<PackType[]> {
  await connectToDatabase()

  const docs = await Pack.find({ recommended: true })
    .limit(6)
    .lean()
    .exec()

  return toPlain<PackType[]>(docs)
}

export async function getPackBySlug(slug: string): Promise<PackType | null> {
  await connectToDatabase()

  const pack = await Pack.findOne({ slug }).lean().exec()
  return pack ? toPlain<PackType>(pack) : null
}

export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  await connectToDatabase()

  const docs = await Blog.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .exec()

  return toPlain<BlogPost[]>(docs)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await connectToDatabase()

  const post = await Blog.findOne({ slug }).lean().exec()
  return post ? toPlain<BlogPost>(post) : null
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

type ProductPageFacet = {
  items: ProductType[]
  total: Array<{ value: number }>
  categoryCounts: Array<{ _id: string | null; count: number }>
  stats: Array<{ _id: null; min: number; max: number }>
}

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
 * Tous les filtres min/max et les stats se basent sur `currentPrice`
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

  const textMatch: Record<string, unknown> = {}
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i')
    textMatch.$or = [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }]
  }

  const catRegex = buildCategoryRegex(category || undefined)
  const categoryStage: PipelineStage.Match | null = catRegex
    ? { $match: { category: { $regex: catRegex } } }
    : null

  const now = new Date()

  const promoAddFields: PipelineStage[] = [
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

  const hasMin = typeof min === 'number' && Number.isFinite(min)
  const hasMax = typeof max === 'number' && Number.isFinite(max)

  const priceStage: PipelineStage.Match | null =
    hasMin || hasMax
      ? {
          $match: {
            currentPrice: {
              ...(hasMin ? { $gte: Number(min) } : {}),
              ...(hasMax ? { $lte: Number(max) } : {}),
            },
          },
        }
      : null

  const itemsSort: PipelineStage.Sort[] =
    sort === 'promo'
      ? [{ $sort: { discountPct: -1, currentPrice: 1 } }]
      : sort === 'price_asc'
        ? [{ $sort: { currentPrice: 1 } }]
        : sort === 'price_desc'
          ? [{ $sort: { currentPrice: -1 } }]
          : sort === 'rating'
            ? [{ $sort: { rating: -1 } }]
            : [{ $sort: { createdAt: -1 } }]

  const itemsPipeline = [
    ...(categoryStage ? [categoryStage] : []),
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
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
  ] as unknown as PipelineStage[]

  const totalPipeline = [
    ...(categoryStage ? [categoryStage] : []),
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    { $count: 'value' },
  ] as unknown as PipelineStage[]

  const categoryCountsPipeline = [
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    {
      $group: {
        _id: { $ifNull: ['$category', 'Autres'] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
  ] as unknown as PipelineStage[]

  const statsPipeline = [
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    {
      $group: {
        _id: null,
        min: { $min: '$currentPrice' },
        max: { $max: '$currentPrice' },
      },
    },
  ] as unknown as PipelineStage[]

  const facetStage = {
    $facet: {
      items: itemsPipeline,
      total: totalPipeline,
      categoryCounts: categoryCountsPipeline,
      stats: statsPipeline,
    },
  } as unknown as PipelineStage

  const pipeline: PipelineStage[] = [{ $match: textMatch }, facetStage]

  const [facet] = await Product.aggregate<ProductPageFacet>(pipeline)

  const safeFacet: ProductPageFacet = facet ?? {
    items: [],
    total: [],
    categoryCounts: [],
    stats: [],
  }

  const items = Array.isArray(safeFacet.items) ? safeFacet.items : []
  const total = Number(safeFacet.total?.[0]?.value || 0)
  const pageCount = Math.max(1, Math.ceil(total / safeSize))

  const counts: Record<string, number> = {}
  for (const row of safeFacet.categoryCounts || []) {
    if (row?._id != null) counts[String(row._id)] = Number(row.count || 0)
  }

  const firstStat = safeFacet.stats?.[0]
  const priceRange =
    firstStat &&
    Number.isFinite(firstStat.min) &&
    Number.isFinite(firstStat.max)
      ? { min: Number(firstStat.min), max: Number(firstStat.max) }
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