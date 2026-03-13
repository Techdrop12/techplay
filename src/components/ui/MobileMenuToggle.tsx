'use client';

interface MobileMenuToggleProps {
  open: boolean;
  toggle: () => void;
}

export default function MobileMenuToggle({ open, toggle }: MobileMenuToggleProps) {
  return (
    <button onClick={toggle} aria-label="Menu" className="sm:hidden">
      {open ? '✖️' : '☰'}
    </button>
  );
}
