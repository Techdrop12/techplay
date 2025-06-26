// ✅ src/components/AccessibilitySkip.js

export default function AccessibilitySkip() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only absolute left-2 top-2 bg-yellow-200 px-3 py-1 rounded z-50"
      tabIndex={0}
    >
      Aller au contenu principal
    </a>
  );
}
