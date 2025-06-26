// ✅ src/pages/api/admin/export-csv.js
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
export default async function handler(req, res) {
  await dbConnect();
  const products = await Product.find();
  const fields = Object.keys(products[0]._doc);
  const csv = [
    fields.join(";"),
    ...products.map(prod => fields.map(f => `"${(prod[f]||"").toString().replace(/"/g, '""')}"`).join(";"))
  ].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=products.csv");
  res.status(200).send(csv);
}
