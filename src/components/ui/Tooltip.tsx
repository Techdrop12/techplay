'use client';

import { useState, useRef } from 'react';

import type { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: ReactNode;
}

export default function Tooltip({ children, text }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hide = () => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setVisible(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={hide}
      onBlur={hide}
      tabIndex={0}
      aria-describedby="tooltip"
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          id="tooltip"
          className="absolute bottom-full mb-2 w-max max-w-xs rounded bg-black text-white text-xs p-2 z-50"
        >
          {text}
        </div>
      )}
    </span>
  );
}
