import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const search = url.searchParams.get('search') ?? '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit = 50;

  const searchStage = search
    ? [{ $match: { $or: [{ email: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }] } }]
    : [];

  try {
    await connectToDatabase();

    const [countAgg, rows] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$user.email', email: { $last: '$user.email' }, name: { $last: '$user.name' } } },
        ...searchStage,
        { $count: 'n' },
      ]).exec(),
      Order.aggregate([
        {
          $group: {
            _id: '$user.email',
            name: { $last: '$user.name' },
            email: { $last: '$user.email' },
            orders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrderAt: { $max: '$createdAt' },
            firstOrderAt: { $min: '$createdAt' },
          },
        },
        ...searchStage,
        { $sort: { lastOrderAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]).exec(),
    ]);

    const total = countAgg[0]?.n ?? 0;
    const pages = Math.ceil(total / limit);

    const clients = rows.map((r) => ({
      email: r.email ?? r._id ?? '',
      name: r.name ?? '',
      orders: r.orders ?? 0,
      totalSpent: Math.round((r.totalSpent ?? 0) * 100) / 100,
      lastOrderAt: r.lastOrderAt ? new Date(r.lastOrderAt).toISOString() : null,
      firstOrderAt: r.firstOrderAt ? new Date(r.firstOrderAt).toISOString() : null,
    }));

    return apiSuccess({ clients, page, pages, total, limit });
  } catch (e) {
    logError('[admin/clients]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
