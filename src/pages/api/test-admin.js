// ✅ /src/pages/api/test-admin.js (test protection admin, debug)
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(200).json({ message: 'Admin access granted', user: token.email });
}
