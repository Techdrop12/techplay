export default function Price({ amount }: { amount: number }) {
  return <span className="text-lg font-semibold text-black">{amount.toFixed(2)} €</span>;
}
