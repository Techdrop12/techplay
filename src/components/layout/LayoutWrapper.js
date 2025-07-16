export default function LayoutWrapper({ children }) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {children}
    </main>
  );
}
