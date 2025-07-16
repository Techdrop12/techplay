'use client';

import { useState } from 'react';

export default function ExpandableSection({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border rounded-lg p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center font-semibold"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </section>
  );
}
