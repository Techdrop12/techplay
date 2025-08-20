import mongoose, { Schema, InferSchemaType } from 'mongoose';

const TrackingEventSchema = new Schema(
  {
    event: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    campaignId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
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

TrackingEventSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
TrackingEventSchema.index({ event: 1, email: 1, createdAt: -1 });

export type TrackingEvent = InferSchemaType<typeof TrackingEventSchema>;
export default (mongoose.models.TrackingEvent as mongoose.Model<TrackingEvent>) ||
  mongoose.model<TrackingEvent>('TrackingEvent', TrackingEventSchema);
