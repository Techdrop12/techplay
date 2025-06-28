// ✅ /src/app/[locale]/admin/dashboard/page.js (dashboard admin synthèse)
import AdminAnalyticsBlock from '@/components/AdminAnalyticsBlock';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord (synthèse)</h1>
      <AdminAnalyticsBlock />
    </div>
  );
}
