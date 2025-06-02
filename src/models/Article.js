import mongoose from 'mongoose'

const ArticleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  createdAt: Date,
})

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema)
