import mongoose, { Schema, InferSchemaType, Types } from 'mongoose';

type JsonTransformRet = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
  id?: string;
};

const ContactSubmissionSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    message: { type: String, required: true, trim: true },
    consent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc: unknown, ret: JsonTransformRet) => {
        if (ret._id != null) ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ContactSubmissionSchema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
  return this._id.toString();
});

export type ContactSubmission = InferSchemaType<typeof ContactSubmissionSchema>;

export default (mongoose.models.ContactSubmission as mongoose.Model<ContactSubmission>) ||
  mongoose.model<ContactSubmission>('ContactSubmission', ContactSubmissionSchema);
