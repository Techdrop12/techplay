import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    stripeSessionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['en attente', 'payée', 'expédiée', 'annulée'],
      default: 'en attente',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
