import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Blog from '@/models/Blog';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

type SearchResult =
  | { type: 'product'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'order'; id: string; title: string; subtitle?: string; href: string }
  | { type: 'blog'; id: string; title: string; subtitle?: string; href: string };

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  if (!q) {
    return apiSuccess({ results: [] });
  }

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  try {
    await connectToDatabase();

    const [products, orders, posts] = await Promise.all([
      Product.find({
        $or: [{ title: rx }, { slug: rx }, { sku: rx }, { category: rx }, { brand: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('_id title slug sku price')
        .lean()
        .exec(),
      Order.find({
        $or: [{ 'user.email': rx }, { 'user.name': rx }, { email: rx }, { 'items.title': rx }],
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('_id user email total status createdAt')
        .lean()
        .exec(),
      Blog.find({ $or: [{ title: rx }, { slug: rx }] })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('_id title slug published createdAt')
        .lean()
        .exec(),
    ]);

    const results: SearchResult[] = [];

    for (const p of products) {
      const id = String(p._id);
      results.push({
        type: 'product',
        id,
        title: p.title ?? '',
        subtitle: p.slug ? `/${p.slug}` : p.sku ?? undefined,
        href: `/admin/produit/${id}`,
      });
    }

    for (const o of orders) {
      const id = String(o._id);
      results.push({
        type: 'order',
        id,
        title: o.user?.name ?? o.email ?? 'Commande',
        subtitle: `${o.total ?? 0} € – ${o.status ?? ''}`,
        href: '/admin/commandes',
      });
    }

    for (const b of posts) {
      const id = String(b._id);
      results.push({
        type: 'blog',
        id,
        title: b.title ?? '',
        subtitle: b.slug ? `/${b.slug}` : undefined,
        href: `/admin/blog/${id}`,
      });
    }

    return apiSuccess(toPlain({ results }));
  } catch (e) {
    logError('[admin/search]', safeErrorForLog(e));
    return apiError('Erreur de recherche', 500);
  }
}

