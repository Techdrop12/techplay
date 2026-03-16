import { error as logError } from '@/lib/logger';
import { getSession } from '@/lib/auth';
import { updateUserByEmail } from '@/lib/db/users';
import { apiError, apiSuccess } from '@/lib/apiResponse';

export async function PATCH(req: Request) {
  const session = await getSession();
  const email = session?.user?.email?.trim();
  if (!email) {
    return apiError('Non connecté', 401);
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Body JSON invalide', 400);
  }

  const name = body?.name != null ? String(body.name).trim() : undefined;
  if (name === undefined) {
    return apiError('Aucune donnée à mettre à jour', 400);
  }

  try {
    const updated = await updateUserByEmail(email, { name });
    if (!updated) {
      return apiError(
        'Compte introuvable en base. La mise à jour du profil est disponible pour les comptes enregistrés.',
        404
      );
    }
    return apiSuccess(updated as Record<string, unknown>);
  } catch (e) {
    logError('[account/profile] PATCH', e);
    return apiError('Erreur mise à jour', 500, {
      details: e instanceof Error ? e.message : undefined,
    });
  }
}
