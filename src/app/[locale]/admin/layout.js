// ✅ /src/app/[locale]/admin/layout.js (layout admin, sécurisé)
import AdminLayout from '@/components/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
