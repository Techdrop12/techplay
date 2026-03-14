'use client';
import { useState } from 'react';

import type { ReactNode } from 'react';

interface InfoTooltipProps {
  text: ReactNode;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-[hsl(var(--accent))] cursor-help">ℹ️</span>
      {visible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text))] px-3 py-2 rounded-lg shadow-[var(--shadow-md)]">
          {text}
        </div>
      )}
    </div>
  );
}
