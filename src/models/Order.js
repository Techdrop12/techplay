// ✅ /src/models/Order.js (commandes, toutes options)
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      email: { type: String, required: true },
      name: String,
      address: String,
      phone: String
    },
    email: String, // fallback pour compatibilité
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        title: String,
        image: String
      }
    ],
    total: Number,
    status: { type: String, default: 'en cours' },
    trackingNumber: String,
    shippingProvider: String,
    shippingDetails: {},
    meta: {},
    coupon: String,
    deliveredAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
