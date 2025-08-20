// src/lib/data.ts
import { connectToDatabase } from './db'
import Product from '@/models/Product'
import Pack from '@/models/Pack'
import Blog from '@/models/Blog'

import type { Product as ProductType, Pack as PackType } from '@/types/product'
import type { BlogPost } from '@/types/blog'

async function loadLocalProducts(): Promise<any[]> {
  try {
    const mod: any = await import('@/data/products')
    const list = mod?.products ?? mod?.default ?? []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/* ===================== PRODUCTS ===================== */

export async function getBestProducts(): Promise<ProductType[]> {
  try {
    await connectToDatabase()
    const rows = await Product.find(
      { featured: true },
      { _id: 1, slug: 1, title: 1, price: 1, oldPrice: 1, image: 1, rating: 1, isNew: 1, isBestSeller: 1, stock: 1 }
    )
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .lean()
    return rows as unknown as ProductType[]
  } catch {
    // fallback local
    const locals = await loadLocalProducts()
    return (locals as any[])
      .filter((p) => p?.featured)
      .slice(0, 8) as ProductType[]
  }
}

export async function getAllProducts(): Promise<ProductType[]> {
  try {
    await connectToDatabase()
    return (await Product.find({}).lean()) as unknown as ProductType[]
  } catch {
    const locals = await loadLocalProducts()
    return locals as ProductType[]
  }
}

export async function getProductBySlug(slug: string): Promise<ProductType | null> {
  const s = String(slug || '').trim()
  if (!s) return null

  try {
    await connectToDatabase()
    const product = await Product.findOne({ slug: s }).lean()
    return product ? (JSON.parse(JSON.stringify(product)) as ProductType) : null
  } catch {
    // fallback local
    const locals = await loadLocalProducts()
    const found = (locals as any[]).find((p) => String(p?.slug || '').trim() === s)
    return found ? (found as ProductType) : null
  }
}

/** SSG helper : slugs produits (safe) */
export async function getAllProductSlugs(): Promise<string[]> {
  try {
    await connectToDatabase()
    const rows = await Product.find({}, { slug: 1, _id: 0 }).lean()
    return rows.map((r: any) => r?.slug).filter(Boolean)
  } catch {
    const locals = await loadLocalProducts()
    return (locals as any[]).map((p) => p?.slug).filter(Boolean)
  }
}

/* ===================== PACKS ===================== */

export async function getRecommendedPacks(): Promise<PackType[]> {
  try {
    await connectToDatabase()
    const rows = await Pack.find(
      { recommended: true },
      { _id: 1, slug: 1, title: 1, description: 1, price: 1, oldPrice: 1, rating: 1, image: 1 }
    )
      .limit(6)
      .lean()
    return rows as unknown as PackType[]
  } catch {
    return []
  }
}

export async function getPackBySlug(slug: string): Promise<PackType | null> {
  const s = String(slug || '').trim()
  if (!s) return null
  try {
    await connectToDatabase()
    const pack = await Pack.findOne({ slug: s }).lean()
    return pack ? (JSON.parse(JSON.stringify(pack)) as PackType) : null
  } catch {
    return null
  }
}

/* ===================== BLOG ===================== */

export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  try {
    await connectToDatabase()
    return (await Blog.find({}).sort({ createdAt: -1 }).limit(10).lean()) as unknown as BlogPost[]
  } catch {
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const s = String(slug || '').trim()
  if (!s) return null
  try {
    await connectToDatabase()
    const post = await Blog.findOne({ slug: s }).lean()
    return post ? (JSON.parse(JSON.stringify(post)) as BlogPost) : null
  } catch {
    return null
  }
}
