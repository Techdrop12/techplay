import mongoose, { Schema, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: String,
    image: String,
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

CategorySchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
CategorySchema.index({ name: 'text', description: 'text' });

export type Category = InferSchemaType<typeof CategorySchema>;
export default (mongoose.models.Category as mongoose.Model<Category>) ||
  mongoose.model<Category>('Category', CategorySchema);
