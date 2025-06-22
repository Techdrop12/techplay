import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    email: String,
    // autres infos utilisateur si besoin
  },
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
    },
  ],
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: String,
  createdAt: Date,
  customerName: String,
  email: String,
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
