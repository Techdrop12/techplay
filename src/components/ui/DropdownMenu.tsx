'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  label: string;
  items?: DropdownMenuItem[];
}

export default function DropdownMenu({ label, items = [] }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
        {label}
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded shadow">
          {items.map((item: DropdownMenuItem, i: number) => (
            <li key={i}>
              <button
                type="button"
                onClick={item.onClick}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
