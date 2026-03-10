import mongoose, { InferSchemaType, Schema, Types } from 'mongoose'

type SerializedTrackingEvent = {
  _id?: Types.ObjectId | string
  __v?: unknown
  id?: string
  [key: string]: unknown
}

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
      transform: (_doc, ret) => {
        const serialized = ret as SerializedTrackingEvent
        if (serialized._id != null) serialized.id = String(serialized._id)
        const { _id, __v, ...rest } = serialized
        return rest
      },
    },
  }
)

TrackingEventSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString()
})

TrackingEventSchema.index({ event: 1, email: 1, createdAt: -1 })

export type TrackingEvent = InferSchemaType<typeof TrackingEventSchema>

const TrackingEventModel =
  (mongoose.models.TrackingEvent as mongoose.Model<TrackingEvent> | undefined) ||
  mongoose.model<TrackingEvent>('TrackingEvent', TrackingEventSchema)

export default TrackingEventModel