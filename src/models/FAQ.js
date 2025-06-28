// ✅ /src/models/FAQ.js (FAQ dynamique, bonus conversion et SEO)
import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
