// Helpers MongoDB pour les utilisateurs
import User from '@/models/User';

export async function getUserByEmail(email) {
  return await User.findOne({ email }).lean();
}

export async function createUser(data) {
  return await User.create(data);
}

export async function getInactiveUsers(sinceDate) {
  return await User.find({
    lastLogin: { $lt: sinceDate },
    isActive: true,
  }).lean();
}
