import mongoose, { Schema, InferSchemaType } from 'mongoose';

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
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString?.();
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

ArticleSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
ArticleSchema.index({ title: 'text', content: 'text', summary: 'text', tags: 'text' });

export type Article = InferSchemaType<typeof ArticleSchema>;
export default (mongoose.models.Article as mongoose.Model<Article>) ||
  mongoose.model<Article>('Article', ArticleSchema);
