import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

type JsonTransformRet = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
  id?: string;
};

const BlogSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: String,
    slug: { type: String, unique: true, index: true, lowercase: true },
    image: String,
    author: String,
    published: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' as const }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: JsonTransformRet) => {
        if (ret._id != null) ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

BlogSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

export type Blog = Omit<InferSchemaType<typeof BlogSchema>, 'articles'> & {
  articles: Types.ObjectId[];
};

export default (mongoose.models.Blog as mongoose.Model<Blog>) ||
  mongoose.model<Blog>('Blog', BlogSchema);
