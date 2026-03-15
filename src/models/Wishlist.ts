import mongoose, { Schema, InferSchemaType, Types } from 'mongoose'

const WishlistSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
)

export type WishlistDoc = InferSchemaType<typeof WishlistSchema>

export default mongoose.models.Wishlist ?? mongoose.model('Wishlist', WishlistSchema)
