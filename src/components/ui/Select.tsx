'use client';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options?: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function Select({ options = [], value, onChange }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
