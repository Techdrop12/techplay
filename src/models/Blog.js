// ✅ src/models/Blog.js

import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    content: String,
    image: String,
    author: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
