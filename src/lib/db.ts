import mongoose from 'mongoose'

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGO_URL

const dbName =
  process.env.MONGODB_DB ||
  process.env.MONGO_DB ||
  'techplay'

if (!uri) {
  throw new Error('Missing Mongo URI (MONGODB_URI / MONGODB_URL / MONGO_URL)')
}

if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error('connectToDatabase cannot be used on the Edge runtime. Use Node.js runtime.')
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('Missing Mongo URI (MONGODB_URI / MONGODB_URL / MONGO_URL)')
  }
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn
  }

  if (!globalWithMongoose.mongoose.promise) {
    mongoose.set('strictQuery', true)
    const dev = process.env.NODE_ENV !== 'production'
    globalWithMongoose.mongoose.promise = mongoose.connect(uri, {
      dbName,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      autoIndex: dev,
    })
  }

  globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise
  return globalWithMongoose.mongoose.conn
}

export async function disconnectDatabase(): Promise<void> {
  if (globalWithMongoose.mongoose.conn) {
    await mongoose.disconnect()
    globalWithMongoose.mongoose.conn = null
    globalWithMongoose.mongoose.promise = null
  }
}
