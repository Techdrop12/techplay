// ✅ /src/models/Blog.js (modèle blog, bonus SEO)
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    slug: { type: String, unique: true },
    image: String,
    author: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
