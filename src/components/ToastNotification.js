'use client';

import { toast } from 'react-hot-toast';

export function notifySuccess(message) {
  toast.success(message, {
    style: {
      borderRadius: '8px',
      background: '#333',
      color: '#fff',
    },
    icon: '✅',
  });
}

export function notifyError(message) {
  toast.error(message, {
    style: {
      borderRadius: '8px',
      background: '#1f2937',
      color: '#fff',
    },
    icon: '❌',
  });
}

export function notifyInfo(message) {
  toast(message, {
    style: {
      borderRadius: '8px',
      background: '#4b5563',
      color: '#fff',
    },
    icon: 'ℹ️',
  });
}
