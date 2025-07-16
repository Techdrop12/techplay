export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm py-6 mt-10 border-t">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} TechPlay. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
