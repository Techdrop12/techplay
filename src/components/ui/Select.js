'use client';

export default function Select({ options = [], value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="block w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(({ label, value: optValue }) => (
        <option key={optValue} value={optValue}>
          {label}
        </option>
      ))}
    </select>
  );
}
