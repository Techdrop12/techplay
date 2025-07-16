'use client';
import { toast } from 'react-hot-toast';

export function showSuccess(msg) {
  toast.success(msg, { style: { background: '#ecfdf5', color: '#047857' } });
}

export function showError(msg) {
  toast.error(msg, { style: { background: '#fef2f2', color: '#b91c1c' } });
}
