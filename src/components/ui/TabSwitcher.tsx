'use client';

import { useState } from 'react';

import type { ReactNode } from 'react';

interface TabItem {
  label: string;
  content?: ReactNode;
}

interface TabSwitcherProps {
  tabs?: TabItem[];
}

export default function TabSwitcher({ tabs = [] }: TabSwitcherProps) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex border-b mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm ${
              i === active ? 'border-b-2 border-[hsl(var(--accent))] font-semibold' : 'text-token-text/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
