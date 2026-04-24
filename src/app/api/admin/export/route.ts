import { apiError, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import Order from '@/models/Order';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';
import { checkAdminRateLimit } from '@/lib/adminRateLimit';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const rl = checkAdminRateLimit(req, 'export');
  if (rl) return rl;

  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  try {
    await connectToDatabase();

    let csv = '';
    let filename = 'export.csv';

    if (type === 'orders') {
      const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5000).lean().exec();
      const rows = orders.map((o) => ({
        id: String(o._id),
        date: new Date(o.createdAt as Date).toLocaleDateString('fr-FR'),
        client: o.user?.name ?? '',
        email: o.user?.email ?? '',
        total: o.total ?? 0,
        statut: o.status ?? '',
        articles: (o.items ?? []).length,
      }));
      csv = toCSV(rows);
      filename = 'commandes.csv';
    } else if (type === 'subscribers') {
      const subs = await NewsletterSubscriber.find({}).sort({ createdAt: -1 }).limit(10000).lean().exec();
      const rows = subs.map((s) => ({
        email: s.email,
        date: new Date(s.createdAt as Date).toLocaleDateString('fr-FR'),
      }));
      csv = toCSV(rows);
      filename = 'abonnes-newsletter.csv';
    } else if (type === 'products') {
      const products = await Product.find({}).sort({ createdAt: -1 }).limit(5000).lean().exec();
      const rows = products.map((p) => ({
        id: String(p._id),
        titre: p.title ?? '',
        slug: p.slug ?? '',
        prix: p.price ?? 0,
        stock: p.stock ?? 0,
        categorie: p.category ?? '',
        marque: p.brand ?? '',
        statut: p.published ? 'publié' : 'brouillon',
      }));
      csv = toCSV(rows);
      filename = 'produits.csv';
    } else {
      return apiError('Type invalide. Valeurs: orders, subscribers, products', 400);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    logError('[admin/export]', safeErrorForLog(e));
    return apiError('Erreur export', 500);
  }
}
