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
