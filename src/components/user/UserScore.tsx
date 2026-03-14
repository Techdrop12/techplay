'use client'
import { useEffect, useState } from 'react'

export default function UserScore({ userId }: { userId: string }) {
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const fetchScore = async () => {
      const res = await fetch(`/api/user/${userId}/score`)
      const data = await res.json()
      setScore(data.score)
    }
    fetchScore()
  }, [userId])

  return score !== null ? (
    <p className="text-sm text-token-text/70">🎖 Score fidélité : {score}</p>
  ) : null
}
