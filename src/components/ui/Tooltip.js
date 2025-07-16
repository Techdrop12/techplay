'use client';

import { useState, useRef } from 'react';

export default function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hide = () => {
    clearTimeout(timeoutRef.current);
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
