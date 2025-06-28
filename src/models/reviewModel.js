// ✅ /src/models/reviewModel.js (avis client, bonus SEO et social proof)
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: {
      name: String,
      email: String
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    verified: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, default: 'published' }
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
