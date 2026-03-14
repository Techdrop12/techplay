'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`w-10 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--surface-2))]'
        }`}
      />
      <span className="ml-3 text-token-text/85">{label}</span>
    </label>
  );
}
