'use client';

export default function Checkbox({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-5 w-5 text-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}
