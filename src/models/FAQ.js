import mongoose from 'mongoose'

const FAQSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, {
  timestamps: true
})

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema)
