import mongoose, { InferSchemaType, Schema, Types } from 'mongoose'

type SerializedToken = {
  _id?: Types.ObjectId | string
  __v?: unknown
  id?: string
  [key: string]: unknown
}

const TokenSchema = new Schema(
  {
    userEmail: { type: String, index: true },
    type: { type: String, enum: ['push', 'email'] as const, required: true, index: true },
    token: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, expires: 0, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const serialized = ret as SerializedToken
        if (serialized._id != null) serialized.id = String(serialized._id)
        const { _id, __v, ...rest } = serialized
        return rest
      },
    },
  }
)

TokenSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

export type Token = InferSchemaType<typeof TokenSchema>

const TokenModel =
  (mongoose.models.Token as mongoose.Model<Token> | undefined) ||
  mongoose.model<Token>('Token', TokenSchema)

export default TokenModel