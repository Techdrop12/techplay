// src/lib/mongoClientPromise.ts — client MongoDB singleton (HMR-safe)
// @deprecated Non importé. Connexion via @/lib/dbConnect ou @/lib/db/mongo
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
if (!uri) throw new Error('MONGODB_URI (ou MONGO_URL) manquant');

const options = {
  maxPoolSize: Number(process.env.MONGO_MAX_POOL || 10),
  minPoolSize: 0,
  serverSelectionTimeoutMS: Number(process.env.MONGO_SST_MS || 5000),
  retryWrites: true,
  w: 'majority' as const,
};

const g = globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
let clientPromise = g._mongoClientPromise;

if (!clientPromise) {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
  g._mongoClientPromise = clientPromise;
}

export function getMongoClient(): Promise<MongoClient> {
  return clientPromise!;
}

export async function getDb(dbName?: string) {
  const client = await clientPromise!;
  return client.db(dbName);
}

export default clientPromise;
