// ✅ /src/models/Pack.ts
import mongoose from 'mongoose'

const PackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.Pack || mongoose.model('Pack', PackSchema)
