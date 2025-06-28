// ✅ /src/data/sync-stock.js (script de synchro stock fournisseur)
import supplierStock from './supplier-stock.json';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function syncStock() {
  await dbConnect();
  for (const item of supplierStock) {
    await Product.updateOne(
      { sku: item.sku },
      { $set: { stock: item.stock } }
    );
  }
  return true;
}
