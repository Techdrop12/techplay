'use client';

import { useId, useState } from 'react';

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
  const baseId = useId();

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="border rounded shadow-sm divide-y">
      {items.map(({ title, content }: AccordionItem, idx: number) => {
        const panelId = `${baseId}-panel-${idx}`;
        const isOpen = openIndex === idx;
        return (
          <div key={title || idx} className="p-4">
            <button
              onClick={() => toggleIndex(idx)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full text-left font-semibold flex justify-between items-center"
            >
              {title}
              <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            <div id={panelId} role="region" hidden={!isOpen} className="mt-2">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
