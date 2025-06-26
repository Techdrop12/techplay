// ✅ src/models/Order.js

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      email: String,
      name: String,
      phone: String
    },
    email: String,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    total: Number,
    status: { type: String, default: 'en cours' },
    address: String,
    postalCode: String,
    city: String,
    country: String,
    phone: String,
    paymentIntentId: String,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
