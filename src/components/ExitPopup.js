'use client'

import { useEffect, useState } from 'react'

export default function ExitPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 10) {
        setVisible(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-2">Attendez ! 👋</h2>
        <p className="mb-4">Voici un petit cadeau avant de partir : -10% avec le code <strong>SAVE10</strong></p>
        <button
          className="mt-2 px-4 py-2 bg-black text-white rounded"
          onClick={() => setVisible(false)}
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
