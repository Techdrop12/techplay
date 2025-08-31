// ✅ src/components/AccessibilitySkip.js
'use client';

export default function AccessibilitySkip() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-yellow-300 text-black px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition"
    >
      Aller au contenu principal
    </a>
  );
}
