import { error as logError } from '@/lib/logger'
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse'
import { connectToDatabase } from '@/lib/db'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET(req: Request) {
  const err = await requireAdmin()
  if (err) return err

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit')) || 25))
  const statusFilter = url.searchParams.get('status')?.trim() || null
  const skip = (page - 1) * limit

  try {
    await connectToDatabase()
    const filter = statusFilter ? { status: new RegExp(`^${statusFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } : {}
    const [docs, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Order.countDocuments(filter),
    ])

    const list = docs.map((d: { _id: unknown; user?: { email?: string; name?: string }; email?: string; items?: unknown[]; total?: number; status?: string; createdAt?: Date }) => ({
      _id: d._id,
      name: d.user?.name ?? d.email ?? '—',
      email: d.user?.email ?? d.email ?? '—',
      items: d.items ?? [],
      total: d.total ?? 0,
      status: d.status ?? '—',
      createdAt: d.createdAt,
    }))

    return apiSuccess(toPlain({ items: list, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) }) as Record<string, unknown>)
  } catch (e) {
    logError('[admin/orders]', safeErrorForLog(e))
    return apiError('Erreur chargement commandes', 500)
  }
}
