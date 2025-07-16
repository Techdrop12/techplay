import { db } from './db'

export async function getBestProducts() {
  return await db.product.findMany({ where: { featured: true }, take: 8 })
}

export async function getRecommendedPacks() {
  return await db.pack.findMany({ where: { recommended: true }, take: 6 })
}

export async function getBlogArticles() {
  return await db.blog.findMany({ take: 10 })
}

export async function getBlogBySlug(slug: string) {
  return await db.blog.findUnique({ where: { slug } })
}
