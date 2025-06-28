// ✅ /src/components/PushPermission.js (bonus PWA/notification)
'use client';

import { useEffect } from 'react';

export default function PushPermission() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);
  return null;
}
