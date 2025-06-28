// ✅ /src/models/Article.js (modèle pour articles IA/blog)
import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: String,
    author: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    summary: String,
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
