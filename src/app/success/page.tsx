export default function SuccessPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-green-600">🎉 Commande validée</h1>
      <p className="text-gray-700 dark:text-gray-300 text-lg">
        Merci pour votre achat ! Vous recevrez un email de confirmation dans quelques instants.
      </p>
    </main>
  )
}
