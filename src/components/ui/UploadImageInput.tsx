'use client';

import { useRef } from 'react';

import type { ChangeEvent } from 'react';

interface UploadImageInputProps {
  onUpload?: (file: File) => void;
}

export default function UploadImageInput({ onUpload }: UploadImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        className="block w-full text-sm text-token-text/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[hsl(var(--accent)/0.15)] file:text-[hsl(var(--accent))] hover:file:opacity-90"
      />
    </div>
  );
}
