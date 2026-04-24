import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const days = Math.min(parseInt(url.searchParams.get('days') ?? '30', 10), 365);

  try {
    await connectToDatabase();

    const since = new Date(Date.now() - days * 86_400_000);

    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    // Fill missing days with 0
    const map = new Map(rows.map((r: { _id: string; revenue: number; orders: number }) => [r._id, r]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      const key = d.toISOString().slice(0, 10);
      const row = map.get(key) as { _id: string; revenue: number; orders: number } | undefined;
      result.push({
        date: key,
        revenue: row ? Math.round(row.revenue * 100) / 100 : 0,
        orders: row?.orders ?? 0,
      });
    }

    return apiSuccess({ data: result });
  } catch (e) {
    logError('[admin/chart]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
