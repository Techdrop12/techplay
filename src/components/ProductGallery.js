'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const mainImage = images[selectedIndex] || '/default.jpg'

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev + 1) % images.length)
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    } else if (e.key === 'Escape') {
      setLightboxOpen(false)
    }
  }

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Miniatures */}
      <div className="flex md:flex-col gap-2 md:w-24 overflow-x-auto md:overflow-y-auto mb-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Miniature ${i + 1}`}
            onClick={() => setSelectedIndex(i)}
            className={`w-16 h-16 object-cover rounded border cursor-pointer transition ${
              i === selectedIndex ? 'border-black scale-105' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Image principale */}
      <div className="relative cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        <motion.img
          key={mainImage}
          src={mainImage}
          alt="Image produit principale"
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full h-96 object-contain rounded shadow"
        />
        <div className="absolute bottom-2 right-2 text-xs bg-black text-white px-2 py-1 rounded">
          Cliquer pour zoom
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.img
              src={mainImage}
              alt="Zoom image"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full object-contain p-4"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
