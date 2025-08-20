import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import data from './import.json';

type Row = {
  title: string; slug: string; category?: string; price: number; image?: string; description?: string; stock?: number; sku?: string;
};

export default async function seedImport(rows: Row[] = data as Row[]) {
  await dbConnect();
  const ops = rows.map((r) => ({
    updateOne: {
      filter: { slug: r.slug },
      update: {
        $setOnInsert: { sku: (r.sku ?? r.slug).toUpperCase(), title: r.title },
        $set: { category: r.category, price: r.price, image: r.image, description: r.description, stock: r.stock ?? 0 },
      },
      upsert: true,
    },
  }));
  const res = await Product.bulkWrite(ops, { ordered: false });
  return { upserted: res.upsertedCount ?? 0, modified: res.modifiedCount ?? 0, matched: res.matchedCount ?? 0 };
}
