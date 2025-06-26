// ✅ src/models/FAQ.js

import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  question: String,
  answer: String,
});

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
