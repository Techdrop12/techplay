// ✅ /src/app/[locale]/test.js (page de test – facultative, peut être supprimée si inutile)
'use client';

export default function TestPage() {
  return (
    <div className="max-w-xl mx-auto p-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Page de test TechPlay</h1>
      <p className="text-gray-600">
        Cette page est réservée à des essais techniques. Supprimez-la en production si non utilisée.
      </p>
    </div>
  );
}
