import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminShell from '@/components/AdminShell';
import { isAdmin } from '@/lib/auth';

/** `x-pathname` est ajouté par `src/middleware.ts` sur `/admin/*` (nécessaire pour exposer `/admin/login` sans session). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const onAdminLogin = pathname === '/admin/login';

  if (onAdminLogin) {
    return <>{children}</>;
  }

  const ok = await isAdmin();
  if (!ok) {
    redirect('/admin/login');
  }
  return <AdminShell>{children}</AdminShell>;
}
