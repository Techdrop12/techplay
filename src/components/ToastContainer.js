// ✅ /src/components/ToastContainer.js (bonus notification toast)
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastContainer() {
  return <Toaster position="top-right" reverseOrder={false} />;
}
