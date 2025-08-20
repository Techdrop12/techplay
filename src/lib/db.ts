// src/lib/db.ts
import mongoose from 'mongoose'

/**
 * Connexion MongoDB robuste pour Next.js (App Router / serverless)
 * - Cache global (évite les reconnections)
 * - Retry avec backoff
 * - Timeouts réglés
 * - Logs en dev (opt-in via MONGOOSE_DEBUG=1)
 * - Helpers: isConnected, disconnect (tests), ping
 */

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined')

const DB_NAME = process.env.MONGODB_DB_NAME || 'techplay'

// Active les logs Mongoose si demandé
if (process.env.NODE_ENV !== 'production' && process.env.MONGOOSE_DEBUG === '1') {
  mongoose.set('debug', true)
}
// Comportement recommandé Mongoose 7+
mongoose.set('strictQuery', true)

// Options de connexion (safe pour Atlas & self-hosted)
const CONNECT_OPTS: mongoose.ConnectOptions = {
  dbName: DB_NAME,
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 7_000, // 7s pour éviter des hangs
  socketTimeoutMS: 45_000,         // sockets plus tolérants
  family: 4,                       // évite certains DNS v6 bizarres
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  listenersAttached?: boolean
}

// Cache global (Next.js hot reload / lambda)
const g = globalThis as any
if (!g.__MONGOOSE_CACHE__) {
  g.__MONGOOSE_CACHE__ = { conn: null, promise: null, listenersAttached: false } as MongooseCache
}
const cache: MongooseCache = g.__MONGOOSE_CACHE__

function attachConnectionLogsOnce() {
  if (cache.listenersAttached) return
  cache.listenersAttached = true

  const log = (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[mongoose]', ...args)
    }
  }
  const warn = (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mongoose]', ...args)
    }
  }

  mongoose.connection.on('connected', () => log('connected:', DB_NAME))
  mongoose.connection.on('reconnected', () => log('reconnected'))
  mongoose.connection.on('disconnecting', () => warn('disconnecting…'))
  mongoose.connection.on('disconnected', () => warn('disconnected'))
  mongoose.connection.on('error', (err) => console.error('[mongoose] error:', err?.message || err))
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function connectWithRetry(
  uri: string,
  opts: mongoose.ConnectOptions,
  maxRetries = 3
): Promise<typeof mongoose> {
  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const conn = await mongoose.connect(uri, opts)
      attachConnectionLogsOnce()
      return conn
    } catch (err) {
      attempt++
      if (attempt > maxRetries) throw err
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[mongoose] connect failed (attempt ${attempt}/${maxRetries}). Retry in ${backoff}ms`)
      }
      await sleep(backoff)
    }
  }
}

/**
 * Ouvre (ou réutilise) la connexion MongoDB.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    cache.promise = connectWithRetry(MONGODB_URI as string, CONNECT_OPTS)
  }
  cache.conn = await cache.promise
  return cache.conn
}

/**
 * Indique si Mongoose est dans un état connecté.
 */
export function isConnected(): boolean {
  return mongoose.connection?.readyState === 1 // 1 = connected
}

/**
 * Ping DB (utile pour healthchecks).
 */
export async function ping(): Promise<boolean> {
  try {
    await connectToDatabase()
    // @ts-expect-error types mongoose ne connaissent pas admin().ping()
    await mongoose.connection.db.admin().ping()
    return true
  } catch {
    return false
  }
}

/**
 * Déconnexion (utile en test / teardown). Inoffensif en prod.
 */
export async function disconnect(): Promise<void> {
  try {
    if (!cache.conn) return
    await mongoose.disconnect()
  } finally {
    cache.conn = null
    cache.promise = null
  }
}

// (optionnel) export par défaut pour compat
export default connectToDatabase
