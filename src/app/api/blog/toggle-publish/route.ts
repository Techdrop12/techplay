import { error as logError } from '@/lib/logger'
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse'
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'
import { requireAdmin } from '@/lib/requireAdmin'

export async function POST(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return apiError('id manquant', 400)

  try {
    await dbConnect()
    const doc = await Blog.findById(id).exec()
    if (!doc) return apiError('Article introuvable', 404)

    doc.published = !doc.published
    if (doc.published && !doc.publishedAt) doc.publishedAt = new Date()
    await doc.save()

    return apiSuccess({ ok: true, published: doc.published })
  } catch (e) {
    logError('[blog/toggle-publish]', safeErrorForLog(e))
    return apiError('Erreur mise à jour', 500)
  }
}
