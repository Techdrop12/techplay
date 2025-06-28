// ✅ /src/lib/db/mongo.js (MongoDB client universel, fallback mongoose)
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) throw new Error('MONGODB_URI is not defined');

let conn = global._mongoConn;

if (!conn) {
  conn = mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoConn = conn;
}

export default conn;
