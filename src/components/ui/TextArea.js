'use client';

export default function Textarea({ label, id, value, onChange, required = false, placeholder, rows = 4 }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
      />
    </div>
  );
}
