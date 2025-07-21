import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!

if (!uri) throw new Error('MONGODB_URI is not defined')

const globalWithMongoose = global as typeof globalThis & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn
  }

  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(uri, {
      dbName: 'techplay',
    })
  }

  globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise
  return globalWithMongoose.mongoose.conn
}
