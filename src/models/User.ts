import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    password: { type: String, select: false },
    isAdmin: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString?.() ?? ret._id;
        const { _id, __v, password, ...rest } = ret;
        return rest;
      },
    },
  }
);

UserSchema.virtual('id').get(function (this: any) {
  return this._id.toString();
});
UserSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof UserSchema>;
export interface UserModel extends Model<User> {
  toSafeObject(user: any): Omit<User, 'password'> & { id: string };
}
UserSchema.statics.toSafeObject = (user: any) => {
  const { password, ...safe } = (user?.toJSON ? user.toJSON() : user) as any;
  return safe;
};

export default (mongoose.models.User as UserModel) || mongoose.model<User, UserModel>('User', UserSchema);
