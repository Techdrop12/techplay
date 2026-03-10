import mongoose, { Schema, Types, type InferSchemaType } from 'mongoose'

const Money = { type: Number, min: 0 } as const

type JsonRecord = Record<string, unknown> & {
  _id?: Types.ObjectId | { toString(): string }
  __v?: number
  id?: string
  images?: string[]
  gallery?: string[]
}

function normalizeProductJson(_doc: unknown, ret: JsonRecord) {
  ret.id = ret._id?.toString?.() ?? String(ret._id ?? '')

  if (
    (!Array.isArray(ret.images) || ret.images.length === 0) &&
    Array.isArray(ret.gallery) &&
    ret.gallery.length > 0
  ) {
    ret.images = ret.gallery
  }

  const { _id, __v, ...rest } = ret
  return rest
}

const ProductSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    gallery: [{ type: String }],
    price: { ...Money, required: true },
    oldPrice: Money,
    stock: { type: Number, default: 0, min: 0, index: true },
    category: { type: String, index: true, trim: true },
    brand: { type: String, index: true, trim: true },
    attributes: { type: Schema.Types.Mixed },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    promo: {
      price: Money,
      startDate: Date,
      endDate: Date,
    },
    featured: { type: Boolean, default: false, index: true },

    // Conservé pour compatibilité complète avec ton code et tes données existantes.
    // On supprime le warning via `suppressReservedKeysWarning: true` dans les options du schéma.
    isNew: { type: Boolean, default: false, index: true },

    isBestSeller: { type: Boolean, default: false, index: true },
    supplier: { type: String, trim: true },
    reference: { type: String, trim: true },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: normalizeProductJson,
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: normalizeProductJson,
    },
  }
)

ProductSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

ProductSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
})

export type Product = InferSchemaType<typeof ProductSchema>

const ProductModel =
  (mongoose.models.Product as mongoose.Model<Product>) ||
  mongoose.model<Product>('Product', ProductSchema)

export default ProductModel