import mongoose from 'mongoose'

import { log } from '@/lib/logger'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) throw new Error('MONGODB_URI is not defined')

type MongooseInstance = typeof mongoose

declare global {
   
  var mongoose: { conn: MongooseInstance | null; promise: Promise<MongooseInstance> | null }
}

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

export default async function connectMongo(): Promise<MongooseInstance> {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI as string, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        dbName: process.env.MONGODB_DB ?? undefined,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority' as const,
      })
      .then((m) => {
        if (process.env.NODE_ENV !== 'production') {
          log('[mongo] Connected', (process.env.MONGODB_DB as string) ?? '')
        }
        return m
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}
