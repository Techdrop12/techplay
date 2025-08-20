// src/lib/blog.js
// Gestion des articles (recherche, filtres, pagination, related) – server-only
import 'server-only'
import dbConnect from './dbConnect'
import Blog from '@/models/Blog'

/** ---------- Config ---------- */
const DEFAULT_LIMIT = 12
const DEFAULT_SORT = '-publishedAt -createdAt'
const LIST_PROJECTION =
  'title slug excerpt coverImage tags category published publishedAt createdAt updatedAt'
const DETAIL_PROJECTION =
  'title slug excerpt content coverImage tags category published publishedAt createdAt updatedAt seo'

/** ---------- Cache mémoire (TTL) ---------- */
const CACHE_TTL = 60_000 // 60s
const cache = new Map()
const now = () => Date.now()
const cacheKey = (name, args) => `${name}:${JSON.stringify(args)}`
const cacheGet = (key) => {
  const it = cache.get(key)
  if (!it || it.exp < now()) return null
  return it.data
}
const cacheSet = (key, data, ttl = CACHE_TTL) => {
  cache.set(key, { data, exp: now() + ttl })
}
export const invalidateBlogCache = () => cache.clear()

/** ---------- Helpers ---------- */
const SORTS = {
  newest: '-publishedAt -createdAt',
  oldest: 'publishedAt createdAt',
  az: 'title',
  za: '-title',
  popular: '-views -publishedAt',
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let TEXT_INDEX_OK = null
async function ensureTextStrategy() {
  if (TEXT_INDEX_OK != null) return TEXT_INDEX_OK
  // Inspecte les indexes une fois (après connexion)
  const idx = await Blog.collection.indexes().catch(() => [])
  TEXT_INDEX_OK = idx.some((i) => i.key && Object.values(i.key).some((v) => v === 'text'))
  return TEXT_INDEX_OK
}

async function buildSearchFilter(q) {
  if (!q || !q.trim()) return {}
  const hasText = await ensureTextStrategy()
  if (hasText) return { $text: { $search: q.trim() } }
  const rx = new RegExp(escapeRegex(q.trim()), 'i')
  return { $or: [{ title: rx }, { excerpt: rx }, { content: rx }] }
}

/** ---------- API ---------- */

/**
 * Liste paginée des articles.
 * @param {Object} opts
 * @param {number} opts.page
 * @param {number} opts.limit
 * @param {boolean} opts.publishedOnly
 * @param {string} opts.tag
 * @param {string} opts.category
 * @param {string} opts.q
 * @param {('newest'|'oldest'|'az'|'za'|'popular'|string)} opts.sort
 */
export async function getPosts(opts = {}) {
  await dbConnect()
  const {
    page = 1,
    limit = DEFAULT_LIMIT,
    publishedOnly = true,
    tag,
    category,
    q,
    sort = DEFAULT_SORT,
  } = opts

  const key = cacheKey('getPosts', { page, limit, publishedOnly, tag, category, q, sort })
  const cached = cacheGet(key)
  if (cached) return cached

  const filter = {}
  if (publishedOnly) filter.published = true
  if (tag) filter.tags = { $in: [tag] }
  if (category) filter.category = category

  Object.assign(filter, await buildSearchFilter(q))

  const sortStr = SORTS[sort] || sort || DEFAULT_SORT
  const skip = Math.max(0, (Number(page) - 1) * Number(limit))

  const [items, total] = await Promise.all([
    Blog.find(filter)
      .select(LIST_PROJECTION)
      .sort(sortStr)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Blog.countDocuments(filter),
  ])

  const result = {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.max(1, Math.ceil(total / Number(limit))),
      hasMore: skip + items.length < total,
    },
  }

  cacheSet(key, result)
  return result
}

/** Récupération d’un article par slug (détaillé) */
export async function getPostBySlug(slug, { includeUnpublished = false } = {}) {
  await dbConnect()
  if (!slug) return null

  const key = cacheKey('getPostBySlug', { slug, includeUnpublished })
  const cached = cacheGet(key)
  if (cached) return cached

  const filter = { slug }
  if (!includeUnpublished) filter.published = true

  const doc = await Blog.findOne(filter).select(DETAIL_PROJECTION).lean()
  cacheSet(key, doc)
  return doc
}

/** Recherche (retourne une petite liste rapide) */
export async function searchPosts(keyword, { limit = 8, publishedOnly = true } = {}) {
  await dbConnect()
  const key = cacheKey('searchPosts', { keyword, limit, publishedOnly })
  const cached = cacheGet(key)
  if (cached) return cached

  const filter = {}
  if (publishedOnly) filter.published = true
  Object.assign(filter, await buildSearchFilter(keyword))

  const items = await Blog.find(filter)
    .select(LIST_PROJECTION)
    .sort('-publishedAt -createdAt')
    .limit(Number(limit))
    .lean()

  cacheSet(key, items, 20_000) // 20s pour la recherche
  return items
}

/** Articles liés (par tags / catégorie), exclus le slug courant */
export async function getRelatedPosts(slugOrPost, { limit = 4 } = {}) {
  await dbConnect()
  let post =
    typeof slugOrPost === 'string'
      ? await Blog.findOne({ slug: slugOrPost }).select('tags category published').lean()
      : slugOrPost

  if (!post) return []

  const filter = {
    published: true,
    slug: { $ne: post.slug },
    $or: [
      ...(Array.isArray(post.tags) && post.tags.length ? [{ tags: { $in: post.tags } }] : []),
      ...(post.category ? [{ category: post.category }] : []),
    ],
  }

  const items = await Blog.find(filter)
    .select(LIST_PROJECTION)
    .sort('-publishedAt -createdAt')
    .limit(Number(limit))
    .lean()

  return items
}

/** Tous les slugs (pour SSG / sitemap) */
export async function getAllSlugs({ publishedOnly = true } = {}) {
  await dbConnect()
  const filter = publishedOnly ? { published: true } : {}
  return Blog.find(filter).select('slug updatedAt').lean()
}

/** Compte rapide (utile pour stats/admin) */
export async function countPosts(filter = {}) {
  await dbConnect()
  return Blog.countDocuments(filter)
}
