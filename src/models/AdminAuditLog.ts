import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const AdminAuditLogSchema = new Schema(
  {
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    userRole: { type: String, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type AdminAuditLogDoc = InferSchemaType<typeof AdminAuditLogSchema>;

const AdminAuditLog =
  (mongoose.models.AdminAuditLog as mongoose.Model<AdminAuditLogDoc>) ??
  mongoose.model<AdminAuditLogDoc>('AdminAuditLog', AdminAuditLogSchema);

export default AdminAuditLog;

