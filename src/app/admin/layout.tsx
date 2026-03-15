import { redirect } from 'next/navigation'

import AdminShell from '@/components/AdminShell'
import { isAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ok = await isAdmin()
  if (!ok) {
    redirect('/login')
  }
  return <AdminShell>{children}</AdminShell>
}
