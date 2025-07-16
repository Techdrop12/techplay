'use client';

import { useState, useRef, useEffect } from 'react';

export default function DropdownMenu({ label, items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => !ref.current.contains(e.target) && setOpen(false);
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
          {items.map((item, i) => (
            <li key={i}>
              <button
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
