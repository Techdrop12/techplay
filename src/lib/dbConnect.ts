/**
 * Connexion MongoDB unifiée : délègue à connectToDatabase (@/lib/db).
 * Conservé pour compatibilité avec les modules existants (blog, users, orders, cron, etc.).
 */
import { connectToDatabase, disconnectDatabase } from '@/lib/db'

export default function dbConnect(): ReturnType<typeof connectToDatabase> {
  return connectToDatabase()
}

export async function dbDisconnect(): Promise<void> {
  return disconnectDatabase()
}

export async function withDb<T>(fn: () => Promise<T> | T): Promise<T> {
  await connectToDatabase()
  return fn()
}
