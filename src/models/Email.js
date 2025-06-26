// ✅ src/models/Email.js

import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema(
  {
    to: String,
    subject: String,
    body: String,
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Email || mongoose.model('Email', EmailSchema);
