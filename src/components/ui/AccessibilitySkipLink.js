export default function AccessibilitySkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only absolute top-0 left-0 bg-white text-black px-4 py-2 z-50"
    >
      Aller au contenu principal
    </a>
  );
}
