'use client';

import { toast } from 'react-hot-toast';

export function showSuccess(message) {
  toast.success(message || '✅ Action réussie', {
    style: {
      background: '#10b981',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  });
}
