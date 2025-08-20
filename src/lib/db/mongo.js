// /src/lib/db/mongo.js
// Connecteur Mongo/Mongoose avec cache global (même pattern que dbConnect.js).
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) throw new Error('MONGODB_URI is not defined')

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

/** @returns {Promise<typeof mongoose>} */
async function connectMongo () {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        dbName: process.env.MONGODB_DB || undefined,
        maxPoolSize: 10,
        retryWrites: true,
        // @ts-ignore
        w: 'majority',
      })
      .then((m) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[mongo] Connected', process.env.MONGODB_DB || '')
        }
        return m
      })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default connectMongo
