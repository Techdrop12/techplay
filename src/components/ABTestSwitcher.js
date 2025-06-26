// ✅ src/components/ABTestSwitcher.js
import { useEffect, useState } from "react";

export default function ABTestSwitcher({ testKey = "main_test", variants, children }) {
  const [variant, setVariant] = useState(variants[0]);
  useEffect(() => {
    let v = localStorage.getItem(testKey);
    if (!v || !variants.includes(v)) {
      v = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(testKey, v);
    }
    setVariant(v);
  }, [testKey, variants]);
  if (!variant) return null;
  return typeof children === "function" ? children(variant) : null;
}
