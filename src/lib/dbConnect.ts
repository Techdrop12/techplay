import mongoose from 'mongoose'

import { log, warn, error as logError } from './logger'

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGO_URL

const DB_NAME =
  process.env.MONGODB_DB ||
  process.env.MONGO_DB ||
  undefined

if (!MONGODB_URI) {
  throw new Error('Missing Mongo URI (MONGODB_URI / MONGODB_URL / MONGO_URL)')
}

if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error('dbConnect cannot be used on the Edge runtime. Use Node.js runtime.')
}

type MongooseInstance = typeof mongoose

declare global {
   
  var __mongoose_cache: { conn: MongooseInstance | null; promise: Promise<MongooseInstance> | null }
   
  var mongoose: typeof __mongoose_cache
}

const g = globalThis
if (!g.__mongoose_cache) {
  g.__mongoose_cache = { conn: null, promise: null }
}
g.mongoose = g.__mongoose_cache

export default async function dbConnect(): Promise<MongooseInstance> {
  if (g.__mongoose_cache.conn) return g.__mongoose_cache.conn

  if (!g.__mongoose_cache.promise) {
    mongoose.set('strictQuery', true)
    const dev = process.env.NODE_ENV !== 'production'
    if (dev) {
      mongoose.connection.on('connected', () => log('[mongo] connected'))
      mongoose.connection.on('reconnected', () => log('[mongo] reconnected'))
      mongoose.connection.on('disconnected', () => warn('[mongo] disconnected'))
      mongoose.connection.on('error', (err) => logError('[mongo] error', err))
    }

    g.__mongoose_cache.promise = mongoose.connect(MONGODB_URI!, {
      dbName: DB_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      autoIndex: dev,
    }).then((m) => {
      if (dev) log('[mongo] connected to', DB_NAME ?? '(default)')
      return m
    })
  }

  g.__mongoose_cache.conn = await g.__mongoose_cache.promise
  return g.__mongoose_cache.conn
}

export async function dbDisconnect(): Promise<void> {
  if (g.__mongoose_cache.conn) {
    await mongoose.disconnect()
    g.__mongoose_cache.conn = null
    g.__mongoose_cache.promise = null
  }
}

export async function withDb<T>(fn: () => Promise<T> | T): Promise<T> {
  await dbConnect()
  return fn()
}
