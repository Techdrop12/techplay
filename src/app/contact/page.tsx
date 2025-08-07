export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Contact</h1>
      <p className="text-center text-gray-700 dark:text-gray-300">
        Envie de nous écrire ? Contactez-nous à{' '}
        <a
          href="mailto:support@techplay.fr"
          className="underline text-blue-600 dark:text-blue-400"
        >
          support@techplay.fr
        </a>
      </p>
    </main>
  )
}
