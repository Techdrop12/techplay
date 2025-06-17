// ✅ Fichier : src/models/Blog.js
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  en: { type: String },
  image: { type: String },
  published: { type: Boolean, default: false },
  publishAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
