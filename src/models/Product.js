import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  image: String
})

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
