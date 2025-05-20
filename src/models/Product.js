import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  slug: String
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
