import mongoose, { Schema, InferSchemaType } from 'mongoose';

const TokenSchema = new Schema(
  {
    userEmail: { type: String, index: true },
    type: { type: String, enum: ['push', 'email'] as const, required: true, index: true },
    token: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    // TTL basé sur la date stockée : expire dès que "expiresAt" est dépassé
    expiresAt: { type: Date, expires: 0, index: true },
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

TokenSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

export type Token = InferSchemaType<typeof TokenSchema>;
export default (mongoose.models.Token as mongoose.Model<Token>) ||
  mongoose.model<Token>('Token', TokenSchema);
