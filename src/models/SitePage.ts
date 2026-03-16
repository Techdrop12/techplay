import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SitePageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

export type SitePageDoc = InferSchemaType<typeof SitePageSchema>;

export default mongoose.models.SitePage ?? mongoose.model<SitePageDoc>('SitePage', SitePageSchema);
