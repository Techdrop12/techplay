import mongoose, { Schema, Types, type InferSchemaType } from 'mongoose'

function toSafeJsonRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

function normalizePackJson(_doc: unknown, ret: unknown) {
  const raw = toSafeJsonRecord(ret) as Record<string, unknown> & {
    _id?: Types.ObjectId | null
    __v?: number
    id?: string
    title?: string | null
    name?: string | null
    image?: string | null
    images?: string[] | null
  }

  raw.id = raw._id?.toString?.() ?? String(raw._id ?? '')

  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title
      : typeof raw.name === 'string' && raw.name.trim()
        ? raw.name
        : 'Pack'

  raw.title = title

  if (!raw.image && Array.isArray(raw.images) && typeof raw.images[0] === 'string') {
    raw.image = raw.images[0]
  }

  const { _id, __v, ...rest } = raw
  return rest
}

const PackSchema = new Schema(
  {
    title: { type: String, trim: true, index: true },
    name: { type: String, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0, index: true },
    brand: { type: String, trim: true },
    sku: { type: String, trim: true },
    items: [{ type: Schema.Types.Mixed }],
    contents: [{ type: Schema.Types.Mixed }],
    tags: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },

    // Conservé pour compatibilité complète avec ton code et tes données existantes.
    // On supprime le warning via `suppressReservedKeysWarning: true` dans les options du schéma.
    isNew: { type: Boolean, default: false, index: true },

    isBestSeller: { type: Boolean, default: false, index: true },
    recommended: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: normalizePackJson,
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: normalizePackJson,
    },
  }
)

PackSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

export type Pack = InferSchemaType<typeof PackSchema>

const PackModel =
  (mongoose.models.Pack as mongoose.Model<Pack>) ||
  mongoose.model<Pack>('Pack', PackSchema)

export default PackModel