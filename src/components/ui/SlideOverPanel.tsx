'use client';

import type { ReactNode } from 'react';

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function SlideOverPanel({ open, onClose, children }: SlideOverPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[hsl(var(--surface))] w-80 shadow-[var(--shadow-lg)] p-4 overflow-y-auto border-l border-[hsl(var(--border))]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-token-text/50 hover:text-[hsl(var(--text))]"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
