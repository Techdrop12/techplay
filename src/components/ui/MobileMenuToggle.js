'use client';

export default function MobileMenuToggle({ open, toggle }) {
  return (
    <button onClick={toggle} aria-label="Menu" className="sm:hidden">
      {open ? '✖️' : '☰'}
    </button>
  );
}
