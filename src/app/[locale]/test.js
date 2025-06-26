// ✅ src/app/[locale]/test.js

'use client'

import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    // Placez ici des tests temporaires pour debug (console, localStorage etc.)
    console.log('TestPage loaded');
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page (debug)</h1>
      <p>
        Ceci est une page de test pour debug.<br />
        <span className="text-sm text-gray-500">
          À supprimer avant mise en ligne définitive.
        </span>
      </p>
    </div>
  );
}
