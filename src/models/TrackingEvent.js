// ✅ src/models/TrackingEvent.js
import mongoose from 'mongoose';

const TrackingEventSchema = new mongoose.Schema({
  event: { type: String, required: true },
  email: { type: String, required: true },
  campaignId: { type: String },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TrackingEvent || mongoose.model('TrackingEvent', TrackingEventSchema);
