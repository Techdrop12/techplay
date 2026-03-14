'use client';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options?: RadioOption[];
  name: string;
  selected: string;
  onChange: (value: string) => void;
}

export default function RadioGroup({ options = [], name, selected, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map(({ label, value }: RadioOption) => (
        <label key={value} className="inline-flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            checked={selected === value}
            onChange={() => onChange(value)}
            className="form-radio text-[hsl(var(--accent))]"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
