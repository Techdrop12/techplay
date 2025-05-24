import db from './mongo' // ou ton système de connexion

export async function getInactiveUsers(days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const users = await db.collection('users').find({
    lastOrderDate: { $lt: cutoff },
  }).toArray()

  return users
}
