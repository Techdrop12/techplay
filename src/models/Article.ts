import mongoose, { Schema, Types, type InferSchemaType } from 'mongoose'

type JsonRecord = Record<string, unknown> & {
  _id?: Types.ObjectId | { toString(): string }
  __v?: number
  id?: string
}

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    content: { type: String, required: true },
    image: String,
    author: String,
    published: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    summary: String,
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: JsonRecord) => {
        ret.id = ret._id?.toString?.() ?? String(ret._id ?? '')
        const { _id, __v, ...rest } = ret
        return rest
      },
    },
  }
)

ArticleSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

ArticleSchema.index({ title: 'text', content: 'text', summary: 'text', tags: 'text' })

export type Article = InferSchemaType<typeof ArticleSchema>

const ArticleModel =
  (mongoose.models.Article as mongoose.Model<Article>) ||
  mongoose.model<Article>('Article', ArticleSchema)

export default ArticleModel