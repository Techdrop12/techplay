// ✅ /src/components/LoaderOverlay.js (loader global, bonus UX)
'use client';

export default function LoaderOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700" />
    </div>
  );
}
