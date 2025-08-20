// /src/lib/db/orders.js
// Helpers pour récupérer / modifier des commandes.
import dbConnect from '../dbConnect.js'
import Order from '../../models/Order.js'
import mongoose from 'mongoose'

/** Normalise un id (string | ObjectId) en ObjectId sûr */
function toObjectId (id) {
  try {
    return new mongoose.Types.ObjectId(String(id))
  } catch {
    return null
  }
}

/**
 * Récupère les commandes d'un utilisateur par email (ou champ user.email).
 * @param {string} email
 */
export async function getUserOrders (email) {
  await dbConnect()
  const e = String(email || '').toLowerCase().trim()
  if (!e) return []
  return Order.find({ $or: [{ 'user.email': e }, { email: e }] })
    .sort({ createdAt: -1 })
    .lean()
    .exec()
}

/** @param {string} id */
export async function getOrderById (id) {
  await dbConnect()
  const _id = toObjectId(id)
  if (!_id) return null
  return Order.findById(_id).lean().exec()
}

/**
 * @param {string} id
 * @param {string} status
 */
export async function updateOrderStatus (id, status) {
  await dbConnect()
  const _id = toObjectId(id)
  if (!_id) return null
  return Order.findByIdAndUpdate(
    _id,
    { $set: { status } },
    { new: true, lean: true }
  ).exec()
}

/** Option bonus : création d’une commande (utile pour tests) */
export async function createOrder (payload) {
  await dbConnect()
  return Order.create(payload)
}

export default {
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
}
