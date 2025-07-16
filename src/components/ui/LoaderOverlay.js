export default function LoaderOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="loader border-t-4 border-white w-12 h-12 rounded-full animate-spin"></div>
    </div>
  );
}
