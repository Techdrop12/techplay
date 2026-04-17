import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

type InsightsResponse = {
  topProducts: { id: string; title: string; totalRevenue: number; orders: number }[];
  weakProducts: { id: string; title: string; lastOrderAt?: string | null }[];
  ordersTrend: { last7d: number; prev7d: number };
  customers: { repeatCount: number; newCount: number };
};

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    await connectToDatabase();

    const now = new Date();
    const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [topProductsAgg, weakProductsAgg, ordersCounts, customersAgg] = await Promise.all([
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orders: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: 1,
            totalRevenue: 1,
            orders: 1,
            title: '$product.title',
          },
        },
      ]).exec(),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            lastOrderAt: { $max: '$createdAt' },
          },
        },
        { $sort: { lastOrderAt: 1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: 1,
            lastOrderAt: 1,
            title: '$product.title',
          },
        },
      ]).exec(),
      Order.aggregate([
        {
          $facet: {
            last7d: [
              { $match: { createdAt: { $gte: last7Start, $lte: now } } },
              { $count: 'count' },
            ],
            prev7d: [
              { $match: { createdAt: { $gte: prev7Start, $lt: last7Start } } },
              { $count: 'count' },
            ],
          },
        },
      ]).exec(),
      Order.aggregate([
        {
          $group: {
            _id: '$user.email',
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            repeatCount: { $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] } },
            newCount: { $sum: { $cond: [{ $eq: ['$count', 1] }, 1, 0] } },
          },
        },
      ]).exec(),
    ]);

    const topProducts = (topProductsAgg || []).map((p: any) => ({
      id: String(p._id),
      title: p.title || '—',
      totalRevenue: Math.round((p.totalRevenue ?? 0) * 100) / 100,
      orders: p.orders ?? 0,
    }));

    const weakProducts = (weakProductsAgg || []).map((p: any) => ({
      id: String(p._id),
      title: p.title || '—',
      lastOrderAt: p.lastOrderAt ? new Date(p.lastOrderAt).toISOString() : null,
    }));

    const counts = ordersCounts?.[0] || {};
    const last7d = counts.last7d?.[0]?.count ?? 0;
    const prev7d = counts.prev7d?.[0]?.count ?? 0;

    const customersCounts = customersAgg?.[0] || {};

    const payload: InsightsResponse = {
      topProducts,
      weakProducts,
      ordersTrend: { last7d, prev7d },
      customers: {
        repeatCount: customersCounts.repeatCount ?? 0,
        newCount: customersCounts.newCount ?? 0,
      },
    };

    return apiSuccess(toPlain(payload));
  } catch (e) {
    logError('[admin/insights]', safeErrorForLog(e));
    return apiError('Erreur insights', 500);
  }
}

