'use client';

import { useRef } from 'react';

export default function UploadImageInput({ onUpload }) {
  const inputRef = useRef();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
      />
    </div>
  );
}
