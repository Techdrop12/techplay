'use client'
import { useEffect, useState } from 'react'

export default function ProgressBar() {
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    const handle = () => {
      const current = window.scrollY
      const height = document.body.scrollHeight - window.innerHeight
      setScroll((current / height) * 100)
    }

    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="h-1 bg-blue-600 transition-all duration-200 ease-linear"
        style={{ width: `${scroll}%` }}
      />
    </div>
  )
}
