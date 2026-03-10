import mongoose, { Schema, type InferSchemaType, type Model, Types } from 'mongoose'

function toSafeJsonRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    password: { type: String, select: false },
    isAdmin: { type: Boolean, default: false, index: true },
    role: { type: String, default: 'user', index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const raw = toSafeJsonRecord(ret) as Record<string, unknown> & {
          _id?: Types.ObjectId | null
          __v?: number
          password?: string | null
          id?: string
        }

        raw.id = raw._id?.toString?.() ?? String(raw._id ?? '')
        delete raw.password
        delete raw.__v
        delete raw._id

        return raw
      },
    },
  }
)

UserSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

UserSchema.index({ email: 1 }, { unique: true })

export type User = InferSchemaType<typeof UserSchema>

export interface UserModel extends Model<User> {
  toSafeObject(user: unknown): Omit<User, 'password'> & { id: string }
}

UserSchema.statics.toSafeObject = (user: unknown) => {
  const raw =
    user &&
    typeof user === 'object' &&
    'toJSON' in user &&
    typeof (user as { toJSON?: unknown }).toJSON === 'function'
      ? toSafeJsonRecord((user as { toJSON: () => unknown }).toJSON())
      : toSafeJsonRecord(user)

  const record = raw as Record<string, unknown> & {
    _id?: Types.ObjectId | null
    id?: string
    password?: string | null
    __v?: number
  }

  const id = typeof record.id === 'string' ? record.id : record._id?.toString?.() ?? ''

  delete record.password
  delete record._id
  delete record.__v

  return { ...(record as Omit<User, 'password'>), id }
}

const UserModelInstance =
  (mongoose.models.User as UserModel) ||
  mongoose.model<User, UserModel>('User', UserSchema)

export default UserModelInstance