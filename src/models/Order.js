import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  email: String,
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
    }
  ],
  total: Number,
  stripeSessionId: String,
  status: {
    type: String,
    enum: ['en attente', 'payée'],
    default: 'en attente'
  }
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
