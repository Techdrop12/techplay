export default function NoResult({ text = 'Aucun résultat trouvé.' }) {
  return (
    <div className="text-center py-12 text-token-text/60 text-sm">
      <p>😕 {text}</p>
    </div>
  );
}
