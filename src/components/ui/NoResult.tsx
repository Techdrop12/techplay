export default function NoResult({ text = 'Aucun résultat trouvé.' }) {
  return (
    <div
      className="text-center py-12 text-token-text/60 text-sm"
      role="status"
      aria-live="polite"
    >
      <p>😕 {text}</p>
    </div>
  )
}
