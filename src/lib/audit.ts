import { headers } from 'next/headers';

import { getSession } from '@/lib/auth';
import type { AppRole } from '@/lib/auth-options';
import AdminAuditLog from '@/models/AdminAuditLog';

type AuditMeta = Record<string, unknown> | undefined;

type LogAdminActionParams = {
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  meta?: AuditMeta;
};

export async function logAdminAction(params: LogAdminActionParams) {
  try {
    const session = await getSession();
    const user = session?.user;

    // Ne pas loguer si aucune session (route publique) pour éviter le bruit
    if (!user?.email) return;

    const allHeaders = await headers();
    const ip =
      allHeaders.get('x-forwarded-for') ??
      allHeaders.get('x-real-ip') ??
      allHeaders.get('cf-connecting-ip') ??
      undefined;
    const userAgent = allHeaders.get('user-agent') ?? undefined;

    await AdminAuditLog.create({
      userId: user.id,
      userEmail: user.email,
      userRole: (user.role as AppRole | undefined) ?? 'user',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId != null ? String(params.resourceId) : undefined,
      ip,
      userAgent,
      meta: params.meta,
    });
  } catch {
    // L’audit ne doit jamais casser l’API : erreurs silencieuses.
  }
}

