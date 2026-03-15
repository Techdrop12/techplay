import 'server-only'

import dbConnect from './dbConnect'

import Blog from '@/models/Blog'

const DEFAULT_LIMIT = 12
const DEFAULT_SORT = '-publishedAt -createdAt'
const LIST_PROJECTION =
  'title slug description image author published publishedAt createdAt updatedAt'
const DETAIL_PROJECTION =
  'title slug description image author published publishedAt createdAt updatedAt'

const CACHE_TTL = 60_000
const cache = new Map<string, { data: unknown; exp: number }>()
const now = () => Date.now()
const cacheKey = (name: string, args: Record<string, unknown>) => `${name}:${JSON.stringify(args)}`
const cacheGet = (key: string): unknown => {
  const it = cache.get(key)
  if (!it || it.exp < now()) return null
  return it.data
}
const cacheSet = (key: string, data: unknown, ttl = CACHE_TTL) => {
  cache.set(key, { data, exp: now() + ttl })
}
export const invalidateBlogCache = () => cache.clear()

const SORTS: Record<string, string> = {
  newest: '-publishedAt -createdAt',
  oldest: 'publishedAt createdAt',
  az: 'title',
  za: '-title',
  popular: '-views -publishedAt',
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let TEXT_INDEX_OK: boolean | null = null
async function ensureTextStrategy(): Promise<boolean> {
  if (TEXT_INDEX_OK != null) return TEXT_INDEX_OK
  const idx = await Blog.collection.indexes().catch(() => [])
  TEXT_INDEX_OK = idx.some(
    (i: { key?: Record<string, unknown> }) =>
      i.key && Object.values(i.key).some((v) => v === 'text')
  )
  return TEXT_INDEX_OK
}

async function buildSearchFilter(q: string | undefined): Promise<Record<string, unknown>> {
  if (!q || !q.trim()) return {}
  const hasText = await ensureTextStrategy()
  if (hasText) return { $text: { $search: q.trim() } }
  const rx = new RegExp(escapeRegex(q.trim()), 'i')
  return { $or: [{ title: rx }, { excerpt: rx }, { content: rx }] }
}

export interface GetPostsOptions {
  page?: number
  limit?: number
  publishedOnly?: boolean
  tag?: string
  category?: string
  q?: string
  sort?: string
}

export interface GetPostsResult {
  items: unknown[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

export async function getPosts(opts: GetPostsOptions = {}): Promise<GetPostsResult> {
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
  const cached = cacheGet(key) as GetPostsResult | null
  if (cached) return cached

  const filter: Record<string, unknown> = {}
  if (publishedOnly) filter.published = true
  if (tag) filter.tags = { $in: [tag] }
  if (category) filter.category = category

  Object.assign(filter, await buildSearchFilter(q))

  const sortStr = (sort && SORTS[sort]) || sort || DEFAULT_SORT
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

  const result: GetPostsResult = {
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

export async function getPostBySlug(
  slug: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {}
): Promise<unknown> {
  await dbConnect()
  if (!slug) return null

  const key = cacheKey('getPostBySlug', { slug, includeUnpublished })
  const cached = cacheGet(key)
  if (cached) return cached

  const filter: Record<string, unknown> = { slug }
  if (!includeUnpublished) filter.published = true

  const doc = await Blog.findOne(filter).select(DETAIL_PROJECTION).lean()
  cacheSet(key, doc)
  return doc
}

export async function searchPosts(
  keyword: string | undefined,
  { limit = 8, publishedOnly = true }: { limit?: number; publishedOnly?: boolean } = {}
): Promise<unknown[]> {
  await dbConnect()
  const key = cacheKey('searchPosts', { keyword, limit, publishedOnly })
  const cached = cacheGet(key) as unknown[] | null
  if (cached) return cached

  const filter: Record<string, unknown> = {}
  if (publishedOnly) filter.published = true
  Object.assign(filter, await buildSearchFilter(keyword))

  const items = await Blog.find(filter)
    .select(LIST_PROJECTION)
    .sort('-publishedAt -createdAt')
    .limit(Number(limit))
    .lean()

  cacheSet(key, items, 20_000)
  return items
}

export async function getRelatedPosts(
  slugOrPost: string | Record<string, unknown>,
  { limit = 4 }: { limit?: number } = {}
): Promise<unknown[]> {
  await dbConnect()
  const post =
    typeof slugOrPost === 'string'
      ? await Blog.findOne({ slug: slugOrPost }).select('slug published').lean()
      : slugOrPost

  if (!post || typeof post !== 'object') return []

  const postObj = post as Record<string, unknown>
  const filter: Record<string, unknown> = {
    published: true,
    slug: { $ne: postObj.slug },
  }

  return Blog.find(filter)
    .select(LIST_PROJECTION)
    .sort('-publishedAt -createdAt')
    .limit(Number(limit))
    .lean()
}

export async function getAllSlugs({
  publishedOnly = true,
}: { publishedOnly?: boolean } = {}): Promise<unknown[]> {
  await dbConnect()
  const filter = publishedOnly ? { published: true } : {}
  return Blog.find(filter).select('slug updatedAt').lean()
}

export async function countPosts(filter: Record<string, unknown> = {}): Promise<number> {
  await dbConnect()
  return Blog.countDocuments(filter)
}
