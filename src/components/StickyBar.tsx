"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-xl z-50">
      <Link href="/products">Voir nos meilleures offres</Link>
    </div>
  );
}
