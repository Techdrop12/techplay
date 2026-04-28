import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const ReturnSchema = new Schema(
  {
    orderRef: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    reason: {
      type: String,
      enum: ['defective', 'wrong_item', 'changed_mind', 'damaged', 'other'],
      required: true,
    },
    details: { type: String, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'refused', 'refunded'],
      default: 'pending',
      index: true,
    },
    items: [
      {
        productName: { type: String },
        quantity: { type: Number, min: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export type ReturnDoc = InferSchemaType<typeof ReturnSchema>;

export default mongoose.models.Return ?? mongoose.model<ReturnDoc>('Return', ReturnSchema);
