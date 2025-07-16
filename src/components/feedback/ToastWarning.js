'use client';

import { toast } from 'react-hot-toast';

export function showWarning(message) {
  toast(message || '⚠️ Attention', {
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#f59e0b',
    },
  });
}
