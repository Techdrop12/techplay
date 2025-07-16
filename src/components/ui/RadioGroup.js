'use client';

export default function RadioGroup({ options = [], name, selected, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(({ label, value }) => (
        <label key={value} className="inline-flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            checked={selected === value}
            onChange={() => onChange(value)}
            className="form-radio text-blue-600"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
