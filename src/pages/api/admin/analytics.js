// ✅ src/pages/api/admin/analytics.js
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect();
  const orders = await Order.find({ status: { $ne: 'annulée' } });
  const products = await Product.countDocuments();

  const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const averageBasket = orders.length
    ? (totalSales / orders.length).toFixed(2)
    : 0;

  res.json({
    totalSales: totalSales.toFixed(2),
    orders: orders.length,
    products,
    averageBasket,
    generatedAt: new Date().toLocaleString("fr-FR"),
  });
}
