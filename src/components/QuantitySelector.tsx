"use client";
import { useState } from "react";

export default function QuantitySelector({ onChange }: { onChange: (val: number) => void }) {
  const [qty, setQty] = useState(1);

  const update = (val: number) => {
    const newVal = Math.max(1, qty + val);
    setQty(newVal);
    onChange(newVal);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => update(-1)} className="px-2 py-1 border rounded">–</button>
      <span>{qty}</span>
      <button onClick={() => update(1)} className="px-2 py-1 border rounded">+</button>
    </div>
  );
}
