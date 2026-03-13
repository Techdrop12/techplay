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
      className="block w-full rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
    >
      {options.map(({ label, value: optValue }) => (
        <option key={optValue} value={optValue}>
          {label}
        </option>
      ))}
    </select>
  );
}
