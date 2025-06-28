// ✅ /src/pages/api/user/me.js (récup infos profil utilisateur connecté)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function handler(req, res) {
  const session = await getServerSession(authOptions, req, res);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  res.status(200).json({ user: session.user });
}
