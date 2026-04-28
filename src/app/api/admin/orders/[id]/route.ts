import { z } from 'zod';

import { error as logError } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { toPlain } from '@/lib/utils';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/requireAdmin';

const ALLOWED_STATUSES = [
  'en cours',
  'en préparation',
  'payée',
  'expédiée',
  'livrée',
  'annulée',
] as const;

const PatchSchema = z.object({
  status: z.enum(ALLOWED_STATUSES),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  if (!id) return apiError('ID manquant', 400);

  try {
    await connectToDatabase();
    const doc = await Order.findById(id).lean().exec();
    if (!doc) return apiError('Commande introuvable', 404);
    return apiSuccess(toPlain(doc) as Record<string, unknown>);
  } catch (e) {
    logError('[admin/orders/:id] GET', e);
    return apiError('Erreur', 500, { details: (e as Error).message });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  if (!id) return apiError('ID manquant', 400);

  const raw = await req.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return apiError(`Statut invalide. Autorisés: ${ALLOWED_STATUSES.join(', ')}`, 400);
  }
  const { status } = parsed.data;

  try {
    await connectToDatabase();
    const doc = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean()
      .exec();
    if (!doc) return apiError('Commande introuvable', 404);
    return apiSuccess(toPlain(doc) as Record<string, unknown>);
  } catch (e) {
    logError('[admin/orders/:id] PATCH', e);
    return apiError('Erreur mise à jour', 500, { details: (e as Error).message });
  }
}
