import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PackSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    recommended: { type: Boolean, default: false, index: true },
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

PackSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});

export type Pack = InferSchemaType<typeof PackSchema>;
export default (mongoose.models.Pack as mongoose.Model<Pack>) ||
  mongoose.model<Pack>('Pack', PackSchema);
