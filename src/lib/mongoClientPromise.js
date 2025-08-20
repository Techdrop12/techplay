// src/lib/mongoClientPromise.js — client MongoDB singleton (HMR-safe)
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || process.env.MONGO_URL
if (!uri) throw new Error('MONGODB_URI (ou MONGO_URL) manquant')

const options = {
  maxPoolSize: Number(process.env.MONGO_MAX_POOL || 10),
  minPoolSize: 0,
  serverSelectionTimeoutMS: Number(process.env.MONGO_SST_MS || 5000),
  retryWrites: true,
  w: 'majority',
}

const g = globalThis
/** @type {Promise<import('mongodb').MongoClient>} */
let clientPromise = g._mongoClientPromise

if (!clientPromise) {
  const client = new MongoClient(uri, options)
  clientPromise = client.connect()
  g._mongoClientPromise = clientPromise
}

export function getMongoClient() { return clientPromise }
/** @param {string} [dbName] */ export async function getDb(dbName) {
  const client = await clientPromise
  return client.db(dbName)
}
export default clientPromise
