import mongoose, { Schema, Types, type InferSchemaType } from 'mongoose';

const Money = { type: Number, min: 0 } as const;

type JsonRecord = Record<string, unknown> & {
  _id?: Types.ObjectId | { toString(): string };
  __v?: number;
  id?: string;
  images?: string[];
  gallery?: string[];
};

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: String,
    image: String,
    images: [{ type: String }],
    gallery: [{ type: String }],
    price: { ...Money, required: true },
    oldPrice: Money,
    stock: { type: Number, default: 0, min: 0, index: true },
    category: { type: String, index: true },
    brand: { type: String, index: true },
    attributes: { type: Schema.Types.Mixed },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    promo: {
      price: Money,
      startDate: Date,
      endDate: Date,
    },
    featured: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    supplier: String,
    reference: String,
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: JsonRecord) => {
        ret.id = ret._id?.toString?.() ?? String(ret._id ?? '');
        if (!ret.images && Array.isArray(ret.gallery)) ret.images = ret.gallery;
        const { _id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

ProductSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

ProductSchema.index({ title: 'text', description: 'text', brand: 'text', category: 'text' });

export type Product = InferSchemaType<typeof ProductSchema>;

const ProductModel =
  (mongoose.models.Product as mongoose.Model<Product>) ||
  mongoose.model<Product>('Product', ProductSchema);

export default ProductModel;
