'use client';

export default function Input({ label, id, type = 'text', value, onChange, required = false, placeholder }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
