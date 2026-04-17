import { error as logError } from '@/lib/logger';
import { logAdminAction } from '@/lib/audit';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/requireAdmin';

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit')) || 25));
  const statusFilter = url.searchParams.get('status')?.trim() || null;
  const q = url.searchParams.get('q')?.trim() || null;
  const minTotal = url.searchParams.get('minTotal');
  const maxTotal = url.searchParams.get('maxTotal');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const skip = (page - 1) * limit;

  try {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};

    if (statusFilter) {
      filter.status = new RegExp(
        `^${statusFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i'
      );
    }

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { 'user.name': rx },
        { 'user.email': rx },
        { email: rx },
        { 'items.title': rx },
      ];
    }

    if (minTotal || maxTotal) {
      const totalFilter: Record<string, unknown> = {};
      if (minTotal && !Number.isNaN(Number(minTotal))) {
        totalFilter.$gte = Number(minTotal);
      }
      if (maxTotal && !Number.isNaN(Number(maxTotal))) {
        totalFilter.$lte = Number(maxTotal);
      }
      if (Object.keys(totalFilter).length > 0) {
        filter.total = totalFilter;
      }
    }

    if (from || to) {
      const dateFilter: Record<string, unknown> = {};
      if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime())) {
          dateFilter.$gte = d;
        }
      }
      if (to) {
        const d = new Date(to);
        if (!Number.isNaN(d.getTime())) {
          dateFilter.$lte = d;
        }
      }
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }
    }
    const [docs, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Order.countDocuments(filter),
    ]);

    const list = docs.map(
      (d: {
        _id: unknown;
        user?: { email?: string; name?: string };
        email?: string;
        items?: unknown[];
        total?: number;
        status?: string;
        createdAt?: Date;
      }) => ({
        _id: d._id,
        name: d.user?.name ?? d.email ?? '—',
        email: d.user?.email ?? d.email ?? '—',
        items: d.items ?? [],
        total: d.total ?? 0,
        status: d.status ?? '—',
        createdAt: d.createdAt,
      })
    );

    const response = apiSuccess(
      toPlain({
        items: list,
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      }) as Record<string, unknown>
    );

    // Audit lecture liste (filtrée) des commandes
    await logAdminAction({
      action: 'order.list',
      resourceType: 'order',
      meta: {
        statusFilter,
        q,
        minTotal,
        maxTotal,
        from,
        to,
        page,
        limit,
      },
    });

    return response;
  } catch (e) {
    logError('[admin/orders]', safeErrorForLog(e));
    return apiError('Erreur chargement commandes', 500);
  }
}
