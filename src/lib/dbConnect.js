import mongoose from 'mongoose';

// 🔌 compat env (garde tes noms actuels)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGO_URL;

const DB_NAME =
  process.env.MONGODB_DB ||
  process.env.MONGO_DB ||
  undefined;

if (!MONGODB_URI) {
  throw new Error('Missing Mongo URI (MONGODB_URI / MONGODB_URL / MONGO_URL)');
}

// ⛳ Mongoose n’est pas supporté sur Edge runtime
if (process.env.NEXT_RUNTIME === 'edge') {
  throw new Error('dbConnect cannot be used on the Edge runtime. Use Node.js runtime.');
}

// 🧠 cache global (compatible avec ton ancien `global.mongoose`)
const g = globalThis;
if (!g.__mongoose_cache) {
  g.__mongoose_cache = { conn: null, promise: null };
}
// pour compat descendante si quelque part tu lisais `global.mongoose`
g.mongoose = g.__mongoose_cache;

async function dbConnect() {
  if (g.__mongoose_cache.conn) return g.__mongoose_cache.conn;

  if (!g.__mongoose_cache.promise) {
    // réglages sûrs
    mongoose.set('strictQuery', true);

    const dev = process.env.NODE_ENV !== 'production';
    if (dev) {
      mongoose.connection.on('connected', () => console.log('[mongo] connected'));
      mongoose.connection.on('reconnected', () => console.log('[mongo] reconnected'));
      mongoose.connection.on('disconnected', () => console.warn('[mongo] disconnected'));
      mongoose.connection.on('error', (err) => console.error('[mongo] error', err));
    }

    g.__mongoose_cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      autoIndex: dev, // index auto en dev seulement
      // maxPoolSize: 10, // décommente si besoin
    }).then((m) => {
      if (dev) console.log('[mongo] connected to', DB_NAME || '(default)');
      return m;
    });
  }

  g.__mongoose_cache.conn = await g.__mongoose_cache.promise;
  return g.__mongoose_cache.conn; // ⬅️ retourne bien l’instance mongoose (comme avant)
}

// utils pratiques (tests/scripts)
async function dbDisconnect() {
  if (g.__mongoose_cache.conn) {
    await mongoose.disconnect();
    g.__mongoose_cache.conn = null;
    g.__mongoose_cache.promise = null;
  }
}

async function withDb(fn) {
  await dbConnect();
  return fn();
}

export default dbConnect;
export { dbDisconnect, withDb };
