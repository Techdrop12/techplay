'use client';

import { useState } from 'react';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border rounded shadow-sm divide-y">
      {items.map(({ title, content }, idx) => (
        <div key={idx} className="p-4">
          <button
            onClick={() => toggleIndex(idx)}
            aria-expanded={openIndex === idx}
            className="w-full text-left font-semibold flex justify-between items-center"
          >
            {title}
            <span>{openIndex === idx ? '−' : '+'}</span>
          </button>
          {openIndex === idx && <div className="mt-2">{content}</div>}
        </div>
      ))}
    </div>
  );
}
