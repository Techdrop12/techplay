// ✅ src/models/Token.js

import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema(
  {
    userEmail: String,
    type: { type: String, enum: ['push', 'email'] },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
