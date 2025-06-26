// ✅ src/models/reviewModel.js

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: {
      email: String,
      name: String
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
