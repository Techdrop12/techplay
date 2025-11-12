"use client"
export default function AccessibilitySkip() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus-ring fixed left-2 top-2 z-[100] rounded-lg bg-token-surface px-3 py-2 border">
      Aller au contenu
    </a>
  )
}
