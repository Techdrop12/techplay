import mongoose, { type InferSchemaType } from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      email: { type: String, required: true },
      name: String,
      address: String,
      phone: String,
    },
    email: String,
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        title: String,
        image: String,
      },
    ],
    total: Number,
    status: { type: String, default: 'en cours' },
    trackingNumber: String,
    shippingProvider: String,
    shippingDetails: mongoose.Schema.Types.Mixed,
    meta: mongoose.Schema.Types.Mixed,
    coupon: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export default mongoose.models.Order ?? mongoose.model('Order', OrderSchema);
