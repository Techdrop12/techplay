'use client';

import { useEffect, useRef } from 'react';

export default function FocusTrap({ children }) {
  const ref = useRef();

  useEffect(() => {
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const firstFocusableElement = ref.current.querySelectorAll(focusableElementsString)[0];
    const focusableContent = ref.current.querySelectorAll(focusableElementsString);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    function trapFocus(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }

    document.addEventListener('keydown', trapFocus);

    firstFocusableElement.focus();

    return () => {
      document.removeEventListener('keydown', trapFocus);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
