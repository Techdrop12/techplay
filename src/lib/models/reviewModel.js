import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Review || mongoose.model('Review', reviewSchema)
