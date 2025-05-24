import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  en: String,
  image: String,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema)
