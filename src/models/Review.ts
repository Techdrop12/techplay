import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, trim: true },
    verified: { type: Boolean, default: false, index: true },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, default: 'published', enum: ['published', 'pending', 'rejected'], index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString?.() ?? ret._id;
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

ReviewSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
ReviewSchema.index({ product: 1, createdAt: -1 });

export type Review = InferSchemaType<typeof ReviewSchema> & { product: Types.ObjectId };
export default (mongoose.models.Review as mongoose.Model<Review>) ||
  mongoose.model<Review>('Review', ReviewSchema);
