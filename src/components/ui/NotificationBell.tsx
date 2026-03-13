'use client';
import { useEffect, useState } from 'react';

export default function NotificationBell({ count = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (count > 0) setVisible(true);
  }, [count]);

  return (
    <div className="relative">
      <span className="text-2xl">🔔</span>
      {visible && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
