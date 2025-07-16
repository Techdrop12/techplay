export function getABVariant(name: string, variants: string[]) {
  const stored = localStorage.getItem(`ab-${name}`)
  if (stored) return stored
  const chosen = variants[Math.floor(Math.random() * variants.length)]
  localStorage.setItem(`ab-${name}`, chosen)
  return chosen
}
