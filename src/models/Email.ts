import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

type JsonTransformRet = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
  id?: string;
};

const EmailSchema = new Schema(
  {
    to: { type: String, required: true, index: true, trim: true, lowercase: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'] as const,
      default: 'pending',
      index: true,
    },
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
      transform: (_doc, ret: JsonTransformRet) => {
        if (ret._id != null) ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

EmailSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

export type Email = InferSchemaType<typeof EmailSchema>;

export default (mongoose.models.Email as mongoose.Model<Email>) ||
  mongoose.model<Email>('Email', EmailSchema);
