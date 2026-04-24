import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { connectToDatabase } from '@/lib/db';
import { error as logError } from '@/lib/logger';
import AdminAuditLog from '@/models/AdminAuditLog';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit = 50;

  try {
    await connectToDatabase();

    const [logs, total] = await Promise.all([
      AdminAuditLog.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AdminAuditLog.countDocuments(),
    ]);

    return apiSuccess({ logs, total, page, limit });
  } catch (e) {
    logError('[admin/audit-logs]', safeErrorForLog(e));
    return apiError('Erreur serveur', 500);
  }
}
