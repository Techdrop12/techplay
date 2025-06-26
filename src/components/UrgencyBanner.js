// ✅ src/components/UrgencyBanner.js

export default function UrgencyBanner({ endsAt }) {
  const rest = endsAt
    ? Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000))
    : 0;
  if (!rest) return null;
  const minutes = Math.floor(rest / 60);
  const seconds = rest % 60;
  return (
    <div className="bg-red-600 text-white py-1 px-3 rounded mb-2 text-sm font-bold animate-pulse">
      ⚡️ Offre flash — il reste {minutes}min {seconds}s !
    </div>
  );
}
