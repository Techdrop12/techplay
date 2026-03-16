import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

type ImportItem = {
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  category?: string;
  brand?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  sku?: string;
};

function slugify(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return apiError('Fichier manquant ou vide', 400);
    }

    const text = await file.text();
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return apiError('JSON invalide', 400);
    }

    const items = Array.isArray(raw) ? raw : [raw];
    if (items.length === 0) {
      return apiError('Aucun produit dans le fichier', 400);
    }

    await connectToDatabase();

    let created = 0;
    for (const row of items as ImportItem[]) {
      const title = row.title != null ? String(row.title).trim() : '';
      if (!title) continue;

      const slug =
        row.slug != null && String(row.slug).trim()
          ? String(row.slug).trim().toLowerCase().replace(/\s+/g, '-')
          : slugify(title);

      const price = Number(row.price);
      if (Number.isNaN(price) || price < 0) continue;

      const existing = await Product.findOne({
        $or: [{ slug }, { sku: (row.sku || slug).toUpperCase() }],
      })
        .lean()
        .exec();
      if (existing) continue;

      const sku =
        row.sku && String(row.sku).trim()
          ? String(row.sku).trim().toUpperCase()
          : `SKU-${slug.replace(/-/g, '').toUpperCase()}-${Date.now().toString(36)}-${created}`;

      await Product.create({
        sku,
        title,
        slug,
        description: row.description != null ? String(row.description) : undefined,
        price,
        oldPrice:
          row.oldPrice != null && !Number.isNaN(Number(row.oldPrice))
            ? Number(row.oldPrice)
            : undefined,
        stock:
          row.stock != null && !Number.isNaN(Number(row.stock))
            ? Math.max(0, Number(row.stock))
            : 0,
        category: row.category != null ? String(row.category).trim() : undefined,
        brand: row.brand != null ? String(row.brand).trim() : undefined,
        image: row.image != null ? String(row.image).trim() : undefined,
        images: Array.isArray(row.images) ? row.images.map((x) => String(x)) : undefined,
        tags: Array.isArray(row.tags) ? row.tags.map((x) => String(x)) : undefined,
      });
      created++;
    }

    return apiSuccess({ success: true, count: created });
  } catch (e) {
    logError('[admin/import-products]', e);
    return apiError("Erreur lors de l'import", 500, { details: safeErrorForLog(e) });
  }
}
