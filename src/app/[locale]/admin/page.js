// ✅ /src/app/[locale]/admin/page.js (dashboard admin, SEO, tracking)
import AdminSidebar from '@/components/AdminSidebar';
import AdminAnalyticsBlock from '@/components/AdminAnalyticsBlock';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-[80vh]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard admin</h1>
        <AdminAnalyticsBlock />
      </main>
    </div>
  );
}
