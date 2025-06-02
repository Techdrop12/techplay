'use client'

import { useEffect, useState } from 'react'

export default function ScoreTracker() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      let localScore = Number(localStorage.getItem('user_score')) || 0
      setScore(localScore)

      const currentPath = window.location.pathname
      const visited = JSON.parse(localStorage.getItem('visited_paths') || '[]')
      if (!visited.includes(currentPath)) {
        visited.push(currentPath)
        localStorage.setItem('visited_paths', JSON.stringify(visited))
        localScore += 1
        localStorage.setItem('user_score', localScore)
        setScore(localScore)
      }

      let scrollDepth = 0
      const handleScroll = () => {
        const scrolled = Math.floor(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        )
        if (scrolled > scrollDepth) {
          scrollDepth = scrolled
          if (scrollDepth > 30 && localScore < 10) {
            localScore += 1
            localStorage.setItem('user_score', localScore)
            setScore(localScore)
          }
        }
      }

      const timer = setTimeout(() => {
        if (localScore < 10) {
          localScore += 2
          localStorage.setItem('user_score', localScore)
          setScore(localScore)
        }
      }, 15000)

      window.addEventListener('scroll', handleScroll)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('scroll', handleScroll)
      }
    } catch (error) {
      console.warn('Erreur ScoreTracker (localStorage inaccessible) :', error)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white border p-3 rounded-lg shadow-lg text-sm z-50">
      <p>🎮 Score : <strong>{score}</strong></p>
    </div>
  )
}
