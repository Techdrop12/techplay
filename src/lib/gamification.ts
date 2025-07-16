export function getUserScore(userId: string): number {
  // Simule une gamification simple
  const base = 100 // score de départ
  const bonus = Math.floor(Math.random() * 50)
  return base + bonus
}
