import { error as logError } from '@/lib/logger'
import { apiError, apiSuccess } from '@/lib/apiResponse'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return apiError('ID manquant', 400)

  try {
    await dbConnect()
    const doc = await Blog.findById(id).lean().exec()
    if (!doc) return apiError('Article introuvable', 404)
    return apiSuccess(toPlain(doc) as Record<string, unknown>)
  } catch (e) {
    logError('[blog/:id] GET', e)
    return apiError('Erreur', 500, { details: (e as Error).message })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  if (!id) return apiError('ID manquant', 400)

  let body: {
    title?: string
    slug?: string
    description?: string
    image?: string
    author?: string
    published?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return apiError('Body JSON invalide', 400)
  }

  const title = body?.title != null ? String(body.title).trim() : undefined
  const slug = body?.slug != null ? String(body.slug).trim().toLowerCase().replace(/\s+/g, '-') : undefined
  if (title !== undefined && !title) {
    return apiError('Titre requis', 400)
  }

  try {
    await dbConnect()
    const doc = await Blog.findById(id).exec()
    if (!doc) return apiError('Article introuvable', 404)

    if (title != null) doc.title = title
    if (slug != null) doc.slug = slug
    if (body?.description !== undefined) doc.description = body.description ? String(body.description) : undefined
    if (body?.image !== undefined) doc.image = body.image ? String(body.image).trim() : undefined
    if (body?.author !== undefined) doc.author = body.author ? String(body.author).trim() : undefined
    if (typeof body?.published === 'boolean') {
      doc.published = body.published
      if (body.published && !doc.publishedAt) doc.publishedAt = new Date()
    }

    if (slug != null && slug !== doc.slug) {
      const existing = await Blog.findOne({ slug, _id: { $ne: id } }).lean().exec()
      if (existing) {
        return apiError('Un autre article utilise ce slug', 400)
      }
    }

    await doc.save()
    return apiSuccess(toPlain(doc) as Record<string, unknown>)
  } catch (e) {
    logError('[blog/:id] PUT', e)
    return apiError('Erreur mise à jour', 500, { details: (e as Error).message })
  }
}
