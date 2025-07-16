export default function QuantitySelector({ quantity, setQuantity }) {
  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="px-2 py-1 rounded border text-sm"
      >−</button>
      <span>{quantity}</span>
      <button
        onClick={() => setQuantity((q) => q + 1)}
        className="px-2 py-1 rounded border text-sm"
      >+</button>
    </div>
  );
}
