import { connectToDatabase } from './db'
import Product from '@/models/Product'
import Pack from '@/models/Pack'
import Blog from '@/models/Blog'

import type { Product as ProductType, Pack as PackType } from '@/types/product'
import type { BlogPost } from '@/types/blog'

export async function getBestProducts(): Promise<ProductType[]> {
  await connectToDatabase()
  // featured + tri par rating/createdAt si présents, projection légère
  const rows = await Product.find(
    { featured: true },
    { _id: 1, slug: 1, title: 1, price: 1, oldPrice: 1, image: 1, rating: 1, isNew: 1, isBestSeller: 1, stock: 1 }
  )
    .sort({ rating: -1, createdAt: -1 })
    .limit(8)
    .lean()
  return rows as unknown as ProductType[]
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
  const rows = await Pack.find(
    { recommended: true },
    { _id: 1, slug: 1, title: 1, description: 1, price: 1, oldPrice: 1, rating: 1, image: 1 }
  )
    .limit(6)
    .lean()
  return rows as unknown as PackType[]
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

/** --- SSG helper : tous les slugs produits (Mongo) --- */
export async function getAllProductSlugs(): Promise<string[]> {
  await connectToDatabase()
  const rows = await Product.find({}, { slug: 1, _id: 0 }).lean()
  return rows.map((r: any) => r?.slug).filter(Boolean)
}
