import mongoose, { InferSchemaType, Schema, Types } from 'mongoose';

type SerializedReview = {
  _id?: Types.ObjectId | string;
  __v?: unknown;
  id?: string;
  [key: string]: unknown;
};

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
    adminReply: { type: String, trim: true },
    adminRepliedAt: { type: Date },
    status: {
      type: String,
      default: 'published',
      enum: ['published', 'pending', 'rejected'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const serialized = ret as SerializedReview;
        if (serialized._id != null) serialized.id = String(serialized._id);
        const { _id, __v, ...rest } = serialized;
        return rest;
      },
    },
  }
);

ReviewSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

ReviewSchema.index({ product: 1, createdAt: -1 });

export type Review = InferSchemaType<typeof ReviewSchema> & { product: Types.ObjectId };

const ReviewModel =
  (mongoose.models.Review as mongoose.Model<Review> | undefined) ||
  mongoose.model<Review>('Review', ReviewSchema);

export default ReviewModel;
