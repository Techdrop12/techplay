// ✅ src/components/LoaderOverlay.js

export default function LoaderOverlay({ show, text = "Chargement…" }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 px-8 py-6 rounded-lg shadow-2xl flex flex-col items-center">
        <svg className="animate-spin mb-2" width={40} height={40} viewBox="0 0 24 24">
          <circle
            className="opacity-20"
            cx="12" cy="12" r="10"
            stroke="#2563eb"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-80"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            d="M12 2a10 10 0 0 1 10 10"
          />
        </svg>
        <span className="text-blue-700 dark:text-blue-300 font-medium">{text}</span>
      </div>
    </div>
  );
}
