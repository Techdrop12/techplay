'use client';

import { toast } from 'react-hot-toast';

export function success(message) {
  toast.success(message, { position: 'top-right' });
}

export function error(message) {
  toast.error(message, { position: 'top-right' });
}

export function info(message) {
  toast('ℹ️ ' + message, { position: 'top-right' });
}
