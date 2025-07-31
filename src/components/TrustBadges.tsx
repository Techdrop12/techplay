export default function TrustBadges() {
  const badges = [
    { emoji: '✅', label: 'Paiement sécurisé' },
    { emoji: '🚀', label: 'Livraison rapide 48h' },
    { emoji: '💬', label: 'Support client 7j/7' },
    { emoji: '🔒', label: 'Satisfait ou remboursé' },
  ]

  return (
    <section
      className="py-6 text-center border-t border-gray-200 dark:border-gray-700"
      aria-label="Badges de confiance"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
        {badges.map(({ emoji, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm"
            role="listitem"
            aria-label={label}
          >
            <span aria-hidden="true" className="text-xl">{emoji}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
