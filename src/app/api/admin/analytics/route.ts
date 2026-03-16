import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await connectToDatabase();

    const [ordersCount, productsCount, ordersAgg] = await Promise.all([
      Order.countDocuments().exec(),
      Product.countDocuments().exec(),
      Order.aggregate([
        { $match: {} },
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
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    logError('[admin/analytics]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
