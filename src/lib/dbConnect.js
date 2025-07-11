// ✅ /src/lib/dbConnect.js (connexion MongoDB universelle, logs auto)
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!MONGODB_URI) throw new Error('MONGODB_URI non définie.');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      dbName: process.env.MONGODB_DB || undefined,
    }).then((mongoose) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('MongoDB connecté sur', MONGODB_URI);
      }
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
