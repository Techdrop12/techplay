import mongoose from 'mongoose';

import type { OrderDoc } from '@/models/Order';

import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

function toObjectId(
  id: string | mongoose.Types.ObjectId | unknown
): mongoose.Types.ObjectId | null {
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

export async function getUserOrders(email: string): Promise<OrderDoc[]> {
  await dbConnect();
  const e = String(email ?? '')
    .toLowerCase()
    .trim();
  if (!e) return [];
  return Order.find({ $or: [{ 'user.email': e }, { email: e }] })
    .sort({ createdAt: -1 })
    .lean()
    .exec() as Promise<OrderDoc[]>;
}

export async function getOrderById(id: string): Promise<OrderDoc | null> {
  await dbConnect();
  const _id = toObjectId(id);
  if (!_id) return null;
  return Order.findById(_id).lean().exec() as Promise<OrderDoc | null>;
}

export async function getOrderByStripeEventId(eventId: string): Promise<OrderDoc | null> {
  await dbConnect();
  const id = String(eventId ?? '').trim();
  if (!id) return null;
  return Order.findOne({ 'meta.stripeEventId': id }).lean().exec() as Promise<OrderDoc | null>;
}

export async function updateOrderStatus(id: string, status: string): Promise<OrderDoc | null> {
  await dbConnect();
  const _id = toObjectId(id);
  if (!_id) return null;
  return Order.findByIdAndUpdate(
    _id,
    { $set: { status } },
    { new: true, lean: true }
  ).exec() as Promise<OrderDoc | null>;
}

export async function createOrder(payload: Record<string, unknown>): Promise<OrderDoc> {
  await dbConnect();
  return Order.create(payload) as Promise<OrderDoc>;
}

export default {
  getUserOrders,
  getOrderById,
  getOrderByStripeEventId,
  updateOrderStatus,
  createOrder,
};
