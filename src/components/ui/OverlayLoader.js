export default function OverlayLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-sm">
      <div className="loader animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}
