import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import type { SupplierStockItem } from './types';
import supplierStock from './supplier-stock.json'; // tsconfig: "resolveJsonModule": true

export interface SyncResult {
  processed: number;
  valid: number;
  invalid: number;
  matched: number;
  modified: number;
  upserted: number;
}

export default async function syncStock(data: SupplierStockItem[] = supplierStock as SupplierStockItem[]) {
  await dbConnect();

  const valid = data.filter((it) => it && typeof it.stock === 'number' && it.stock >= 0 && it.sku);
  const ops = valid.map((item) => ({
    updateOne: {
      filter: { sku: item.sku.toUpperCase() },
      update: { $set: { stock: item.stock, supplier: item.supplier } },
      upsert: false, // on ne crée pas d’articles par accident
    },
  }));

  if (ops.length === 0) {
    return { processed: data.length, valid: 0, invalid: data.length, matched: 0, modified: 0, upserted: 0 };
  }

  const res = await Product.bulkWrite(ops, { ordered: false });
  return {
    processed: data.length,
    valid: valid.length,
    invalid: data.length - valid.length,
    matched: res.matchedCount ?? 0,
    modified: res.modifiedCount ?? 0,
    upserted: res.upsertedCount ?? 0,
  } as SyncResult;
}
