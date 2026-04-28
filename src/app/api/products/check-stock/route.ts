import { z } from 'zod';

import { apiError, apiJson } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import { safeErrorForLog } from '@/lib/apiResponse';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

const stockLimiter = createRateLimiter({
  id: 'check-stock',
  limit: 30,
  intervalMs: 60_000,
  strategy: 'fixed-window',
});

const BodySchema = z.object({
  items: z.array(
    z.object({
      slug: z.string().min(1).max(120),
      quantity: z.number().int().positive().max(99),
    })
  ).min(1).max(50),
});

type StockItem = { slug: string; stock: number; title: string };

export async function POST(req: Request) {
  const ip = ipFromRequest(req);
  const rl = stockLimiter.check(ip);
  if (!rl.ok) return apiError('Trop de tentatives', 429);

  const raw = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return apiError('Données invalides', 400);

  const { items } = parsed.data;
  const slugs = items.map((i) => i.slug);

  try {
    await connectToDatabase();
    const products = await Product.find(
      { slug: { $in: slugs } },
      { slug: 1, stock: 1, title: 1 }
    )
      .lean()
      .exec() as StockItem[];

    const stockMap = new Map(products.map((p) => [p.slug, p]));

    const outOfStock: { slug: string; title: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const product = stockMap.get(item.slug);
      if (!product) continue;
      const available = typeof product.stock === 'number' ? product.stock : 999;
      if (available < item.quantity) {
        outOfStock.push({
          slug: item.slug,
          title: product.title,
          requested: item.quantity,
          available,
        });
      }
    }

    return apiJson({ ok: outOfStock.length === 0, outOfStock });
  } catch (err) {
    logError('[check-stock]', safeErrorForLog(err));
    return apiError('Erreur serveur', 500);
  }
}

export async function GET() {
  return apiError('Method Not Allowed', 405);
}
