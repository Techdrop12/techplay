import mongoose, { Schema, InferSchemaType, Types } from 'mongoose'

type JsonTransformRet = Record<string, unknown> & {
  _id?: unknown
  __v?: unknown
  id?: string
}

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
      transform: (_doc, ret: JsonTransformRet) => {
        if (ret._id != null) ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

CategorySchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

CategorySchema.index({ name: 'text', description: 'text' })

export type Category = InferSchemaType<typeof CategorySchema>

export default (mongoose.models.Category as mongoose.Model<Category>) ||
  mongoose.model<Category>('Category', CategorySchema)