// ✅ src/models/Article.js

import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    content: String,
    author: String,
    image: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
