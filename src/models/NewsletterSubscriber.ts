import mongoose, { Schema, InferSchemaType } from 'mongoose';

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    locale: { type: String, trim: true },
    pathname: { type: String, trim: true },
    source: { type: String, default: 'footer', trim: true },
    confirmed: { type: Boolean, default: false, index: true },
    confirmToken: { type: String, index: true, sparse: true },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

NewsletterSubscriberSchema.index({ email: 1 }, { unique: true });

export type NewsletterSubscriberDoc = InferSchemaType<typeof NewsletterSubscriberSchema>;

export default mongoose.models.NewsletterSubscriber ??
  mongoose.model<NewsletterSubscriberDoc>('NewsletterSubscriber', NewsletterSubscriberSchema);
