import client from './mongo';

export async function getOrders() {
  const db = client.db();
  return db.collection('orders').find().toArray();
}
