// ✅ /src/lib/db/users.js (helpers utilisateurs)
import User from '../../models/User';

export async function getUserByEmail(email) {
  return await User.findOne({ email }).lean();
}

export async function createUser(data) {
  return await User.create(data);
}
