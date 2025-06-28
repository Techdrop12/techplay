// ✅ /src/lib/db/orders.js (helpers pour récupérer/mettre à jour commandes)
import Order from '../../models/Order';

export async function getUserOrders(email) {
  return await Order.find({
    $or: [{ 'user.email': email }, { email }],
  })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getOrderById(id) {
  return await Order.findById(id).lean();
}

export async function updateOrderStatus(id, status) {
  return await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
}
