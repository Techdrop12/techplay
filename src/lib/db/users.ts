import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function getUserByEmail(email: string): Promise<unknown> {
  await dbConnect();
  const e = String(email ?? '')
    .toLowerCase()
    .trim();
  if (!e) return null;
  return User.findOne({ email: e }).lean().exec();
}

export async function createUser(data: Record<string, unknown>): Promise<unknown> {
  await dbConnect();
  const payload = { ...data };
  if (payload?.email) payload.email = String(payload.email).toLowerCase().trim();
  return User.create(payload);
}

export async function getInactiveUsers(sinceDate: Date | string): Promise<unknown[]> {
  await dbConnect();
  const d = sinceDate instanceof Date ? sinceDate : new Date(sinceDate);
  return User.find({ lastLogin: { $lt: d }, isActive: true })
    .lean()
    .exec() as Promise<unknown[]>;
}

export async function updateUserByEmail(email: string, data: { name?: string }): Promise<unknown> {
  await dbConnect();
  const e = String(email ?? '')
    .toLowerCase()
    .trim();
  if (!e) return null;
  const doc = await User.findOneAndUpdate({ email: e }, { $set: data }, { new: true })
    .select('name email')
    .lean()
    .exec();
  return doc;
}

export default { getUserByEmail, createUser, getInactiveUsers, updateUserByEmail };
