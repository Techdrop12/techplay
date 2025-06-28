// ✅ /src/models/Product.js (produit complet, optimisé e-commerce)
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: String,
    brand: String,
    attributes: {},
    gallery: [String],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    promo: {
      price: Number,
      startDate: Date,
      endDate: Date
    },
    featured: { type: Boolean, default: false },
    supplier: String,
    reference: String
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
