import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const range = url.searchParams.get('range') ?? 'all';
  const days = RANGE_DAYS[range];
  const dateFilter = days
    ? { createdAt: { $gte: new Date(Date.now() - days * 86_400_000) } }
    : {};

  try {
    await connectToDatabase();

    const [ordersCount, productsCount, ordersAgg] = await Promise.all([
      Order.countDocuments(dateFilter).exec(),
      Product.countDocuments().exec(),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalSales: { $sum: '$total' }, count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const totalSales = ordersAgg[0]?.totalSales ?? 0;
    const averageBasket = ordersCount > 0 ? totalSales / ordersCount : 0;

    return apiSuccess({
      totalSales: Math.round(totalSales * 100) / 100,
      orders: ordersCount,
      products: productsCount,
      averageBasket: Math.round(averageBasket * 100) / 100,
      range,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    logError('[admin/analytics]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
