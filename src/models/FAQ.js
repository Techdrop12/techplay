import mongoose from 'mongoose'

const FAQSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  question: String,
  answer: String
})

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema)
