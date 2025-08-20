// /src/lib/db/users.js
// Helpers MongoDB pour les utilisateurs
import dbConnect from '../dbConnect.js'
import User from '../../models/User.js'

/** @param {string} email */
export async function getUserByEmail (email) {
  await dbConnect()
  const e = String(email || '').toLowerCase().trim()
  if (!e) return null
  return User.findOne({ email: e }).lean().exec()
}

export async function createUser (data) {
  await dbConnect()
  // Normalisation simple
  if (data?.email) data.email = String(data.email).toLowerCase().trim()
  return User.create(data)
}

/**
 * Utilisateurs actifs qui ne se sont pas connectés depuis la date.
 * @param {Date} sinceDate
 */
export async function getInactiveUsers (sinceDate) {
  await dbConnect()
  const d = sinceDate instanceof Date ? sinceDate : new Date(sinceDate)
  return User.find({ lastLogin: { $lt: d }, isActive: true }).lean().exec()
}

export default { getUserByEmail, createUser, getInactiveUsers }
