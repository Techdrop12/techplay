import mongoose, { Schema, InferSchemaType } from 'mongoose';

const Money = { type: Number, min: 0 };

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: String,
    image: String,
    gallery: [{ type: String }],
    price: { ...Money, required: true },
    stock: { type: Number, default: 0, min: 0, index: true },
    category: { type: String, index: true },
    brand: { type: String, index: true },
    attributes: { type: Schema.Types.Mixed },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    promo: { price: Money, startDate: Date, endDate: Date },
    featured: { type: Boolean, default: false, index: true },
    supplier: String,
    reference: String,
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

ProductSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
ProductSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text' });

export type Product = InferSchemaType<typeof ProductSchema>;
export default (mongoose.models.Product as mongoose.Model<Product>) ||
  mongoose.model<Product>('Product', ProductSchema);
