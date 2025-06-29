'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function ProductGallery({ images = [] }) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const mainImage =
    safeImages[selectedIndex] ||
    safeImages[0] ||
    '/default.jpg';

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev + 1) % safeImages.length);
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    } else if (e.key === 'Escape') {
      setLightboxOpen(false);
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className="outline-none">
      {/* Miniatures */}
      <div className="flex md:flex-col gap-2 md:w-24 overflow-x-auto md:overflow-y-auto mb-4">
        {safeImages.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`Miniature ${i + 1}`}
            width={64}
            height={64}
            onClick={() => setSelectedIndex(i)}
            className={`w-16 h-16 object-cover rounded border cursor-pointer transition ${
              i === selectedIndex ? 'border-black scale-105' : 'border-gray-300'
            }`}
            loading="lazy"
            unoptimized
          />
        ))}
      </div>

      {/* Image principale */}
      <div className="relative cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        <motion.div
          key={mainImage}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-96"
        >
          <Image
            src={mainImage}
            alt="Image principale du produit"
            fill
            className="object-contain rounded shadow"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        </motion.div>
        <div className="absolute bottom-2 right-2 text-xs bg-black text-white px-2 py-1 rounded">
          Cliquer pour zoom
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full max-w-4xl max-h-[90vh] p-4"
            >
              <Image
                src={mainImage}
                alt="Image zoomée du produit"
                fill
                className="object-contain"
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
