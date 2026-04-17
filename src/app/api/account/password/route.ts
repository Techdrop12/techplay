import { error as logError } from '@/lib/logger';
import { getSession } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/bcrypt';
import User from '@/models/User';

export async function POST(req: Request) {
  const session = await getSession();
  const email = session?.user?.email?.trim();
  if (!email) return apiError('Non connecté', 401);

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Body JSON invalide', 400);
  }

  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    return apiError('Les deux mots de passe sont requis', 400);
  }
  if (newPassword.length < 8) {
    return apiError('Le nouveau mot de passe doit faire au moins 8 caractères', 400);
  }
  if (newPassword.length > 128) {
    return apiError('Mot de passe trop long', 400);
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').lean();
    if (!user || !user.password) {
      return apiError('Compte introuvable ou sans mot de passe défini', 404);
    }

    const valid = await verifyPassword(currentPassword, user.password as string);
    if (!valid) {
      return apiError('Mot de passe actuel incorrect', 401);
    }

    const hash = await hashPassword(newPassword);
    await User.updateOne({ email: email.toLowerCase() }, { $set: { password: hash } });

    return apiSuccess({ ok: true });
  } catch (e) {
    logError('[account/password] POST', e);
    return apiError('Erreur serveur', 500);
  }
}
