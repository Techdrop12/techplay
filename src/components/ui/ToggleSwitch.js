'use client';

export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`w-10 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      />
      <span className="ml-3 text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}
