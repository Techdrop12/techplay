"use client";
import { useState } from "react";

export default function ImageWithZoom({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div onClick={() => setZoomed(!zoomed)} className="cursor-zoom-in">
      <img
        src={src}
        alt={alt}
        className={`transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}
      />
    </div>
  );
}
