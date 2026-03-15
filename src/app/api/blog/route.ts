import { error as logError } from '@/lib/logger'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'
import { apiError, apiSuccess } from '@/lib/apiResponse'
import { blogCreateSchema, type BlogCreateInput } from '@/lib/zodSchemas'

function slugify(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return apiError('Body JSON invalide', 400)
  }

  const parsed = blogCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Données invalides'
    return apiError(msg, 400)
  }

  const body = parsed.data as BlogCreateInput
  const title = body.title
  const slug =
    body.slug && body.slug.length > 0
      ? body.slug.toLowerCase().replace(/\s+/g, '-')
      : slugify(title)

  try {
    await dbConnect()
    const existing = await Blog.findOne({ slug }).lean().exec()
    if (existing) {
      return apiError('Un article avec ce slug existe déjà', 400)
    }

    const published = Boolean(body.published)
    const doc = await Blog.create({
      title,
      slug,
      description: body.description ?? undefined,
      image: body.image && body.image.length > 0 ? body.image : undefined,
      author: body.author ?? undefined,
      published,
      publishedAt: published ? new Date() : undefined,
    })

    return apiSuccess(toPlain(doc) as Record<string, unknown>)
  } catch (e) {
    logError('[blog] POST', e)
    return apiError('Erreur lors de la création', 500, {
      details: e instanceof Error ? e.message : undefined,
    })
  }
}
