'use client';

import { toast } from 'react-hot-toast';

export function showInfo(message) {
  toast(message || 'ℹ️ Information', {
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3b82f6',
    },
  });
}
