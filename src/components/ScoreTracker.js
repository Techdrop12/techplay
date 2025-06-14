'use client'

import { useEffect, useState } from 'react'

export default function ScoreTracker() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return

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
        window.dispatchEvent(new CustomEvent('user_score_updated', { detail: localScore }))
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
            window.dispatchEvent(new CustomEvent('user_score_updated', { detail: localScore }))
          }
        }
      }

      const timer = setTimeout(() => {
        if (localScore < 10) {
          localScore += 2
          localStorage.setItem('user_score', localScore)
          setScore(localScore)
          window.dispatchEvent(new CustomEvent('user_score_updated', { detail: localScore }))
        }
      }, 15000)

      window.addEventListener('scroll', handleScroll)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('scroll', handleScroll)
      }
    } catch (error) {
      console.warn('Erreur ScoreTracker (localStorage) :', error)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 p-4 rounded-xl shadow-xl text-sm z-50 w-56">
      <p className="mb-1 font-semibold">🎮 Score utilisateur</p>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(score * 10, 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 text-right">{score} / 10</p>
    </div>
  )
}
