'use client'
import { useEffect, useState } from 'react'

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) setShow(true)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded max-w-sm text-center">
        <h3 className="text-xl font-bold mb-2">Avant de partir...</h3>
        <p className="text-sm text-gray-600 mb-4">Profitez de -10 % avec le code WELCOME10</p>
        <button
          className="mt-2 bg-brand text-white px-4 py-2 rounded"
          onClick={() => setShow(false)}
        >
          Continuer mes achats
        </button>
      </div>
    </div>
  )
}
