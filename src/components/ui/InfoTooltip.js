'use client';
import { useState } from 'react';

export default function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-blue-500 cursor-help">ℹ️</span>
      {visible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 rounded shadow">
          {text}
        </div>
      )}
    </div>
  );
}
