'use client';

export default function LoadingOverlay({ isLoading }) {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
    </div>
  );
}
