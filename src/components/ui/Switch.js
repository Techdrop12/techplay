'use client';

export default function Switch({ enabled, onToggle }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onToggle(!enabled)}
      className={`relative w-10 h-5 transition rounded-full ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 transition rounded-full bg-white ${enabled ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}
