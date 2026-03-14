'use client';

import { useState } from 'react';

import type { ReactNode } from 'react';

interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border rounded shadow-sm divide-y">
      {items.map(({ title, content }: AccordionItem, idx: number) => (
        <div key={title || idx} className="p-4">
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
