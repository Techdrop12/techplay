import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // image principale
  images: [{ type: String }], // galerie d’images
  category: { type: String },
  tags: [{ type: String }],
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  alsoBought: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
})

export default mongoose.models.Product || mongoose.model('Product', productSchema)
