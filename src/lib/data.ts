import { connectToDatabase } from './db'
import Product from '@/models/Product'
import Pack from '@/models/Pack'
import Blog from '@/models/Blog'

import type { Product as ProductType, Pack as PackType } from '@/types/product'
import type { BlogPost } from '@/types/blog'

export async function getBestProducts(): Promise<ProductType[]> {
  await connectToDatabase()
  return (await Product.find({ featured: true }).limit(8).lean()) as unknown as ProductType[]
}

export async function getAllProducts(): Promise<ProductType[]> {
  await connectToDatabase()
  return (await Product.find({}).lean()) as unknown as ProductType[]
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

/* ========= Pagination & tri côté base pour /products ========= */

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo'

type GetProductsPageInput = {
  q?: string
  min?: number
  max?: number
  sort?: SortKey
  page?: number
  pageSize?: number
}

export async function getProductsPage({
  q,
  min,
  max,
  sort = 'new',
  page = 1,
  pageSize = 24,
}: GetProductsPageInput) {
  await connectToDatabase()

  const filter: Record<string, any> = {}

  if (q && q.trim()) {
    const rx = new RegExp(q.trim(), 'i')
    filter.$or = [
      { title: rx },
      { description: rx },
      { tags: rx }, // si tags est un array de strings, Mongo matchera un élément
    ]
  }

  if (typeof min === 'number' || typeof max === 'number') {
    filter.price = {}
    if (typeof min === 'number') filter.price.$gte = min
    if (typeof max === 'number') filter.price.$lte = max
  }

  const sortMap: Record<SortKey, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    // "promo" sans champ dédié : on approxime par oldPrice desc puis price asc
    promo: { oldPrice: -1, price: 1 },
    // nouveautés : isNew desc puis createdAt desc
    new: { isNew: -1, createdAt: -1 },
  }

  const total = await Product.countDocuments(filter)

  const items = await Product.find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip((Math.max(1, page) - 1) * pageSize)
    .limit(pageSize)
    .lean()

  return {
    items: items as unknown as ProductType[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}
