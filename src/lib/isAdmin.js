import { getToken } from 'next-auth/jwt'

export default async function isAdmin(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token || token.email !== process.env.ADMIN_EMAIL) {
    return false
  }

  // Exemple simple 2FA par header X-Admin-2fa
  if (!req.headers['x-admin-2fa'] || req.headers['x-admin-2fa'] !== process.env.ADMIN_2FA_CODE) {
    return false
  }

  return true
}
