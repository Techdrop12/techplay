'use client';

import { toast } from 'react-hot-toast';

export function showError(message) {
  toast.error(message || '❌ Une erreur est survenue', {
    style: {
      background: '#ef4444',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  });
}
