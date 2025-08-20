import mongoose, { Schema, InferSchemaType } from 'mongoose';

const EmailSchema = new Schema(
  {
    to: { type: String, required: true, index: true, trim: true, lowercase: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'] as const, default: 'pending', index: true },
    createdAt: { type: Date, default: Date.now, index: true },

    // optionnels (robuste en prod)
    sentAt: Date,
    scheduledAt: Date,
    attempts: { type: Number, default: 0, min: 0 },
    providerMessageId: String,
    error: String,
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

EmailSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

export type Email = InferSchemaType<typeof EmailSchema>;
export default (mongoose.models.Email as mongoose.Model<Email>) ||
  mongoose.model<Email>('Email', EmailSchema);
