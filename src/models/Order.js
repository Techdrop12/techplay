// src/models/Order.js

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    email: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customerName: String,
  email: String,
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
