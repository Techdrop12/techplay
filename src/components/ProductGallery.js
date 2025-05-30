'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const mainImage = images[selectedIndex] || '/default.jpg'

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Miniatures */}
      <div className="flex md:flex-col gap-2 md:w-24 overflow-x-auto md:overflow-y-auto">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Image ${i + 1}`}
            onClick={() => setSelectedIndex(i)}
            className={`w-16 h-16 object-cover rounded border cursor-pointer transition ${
              i === selectedIndex ? 'border-black scale-105' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Image principale animée */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </div>
    </div>
  )
}
