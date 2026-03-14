'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  selected?: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
}

export default function Dropdown({ label, options, selected, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] px-4 py-2 bg-[hsl(var(--surface))] text-sm font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {selected ? selected.label : label}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          {options.map((option: DropdownOption) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-token-text/85 hover:bg-[hsl(var(--surface-2))]"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
