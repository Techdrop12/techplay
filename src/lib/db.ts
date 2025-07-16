import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!

let cached = (global as any).mongoose || { conn: null, promise: null }

if (!cached.promise) {
  cached.promise = mongoose.connect(uri, { dbName: 'techplay' }).then((mongoose) => {
    return mongoose
  })
}

export const db = await cached.promise
