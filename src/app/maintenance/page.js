// ✅ /src/app/maintenance/page.js (mode maintenance)
export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Maintenance en cours</h1>
      <p className="text-gray-600">
        Le site TechPlay est temporairement en maintenance.<br />
        Merci de votre compréhension.
      </p>
    </div>
  );
}
