const VARIANTS = ['A', 'B', 'C']
const STORAGE_KEY = 'ab_test_combined'

export function getUserVariant() {
  if (typeof window === 'undefined') return 'A'

  let variant = localStorage.getItem(STORAGE_KEY)
  if (!variant || !VARIANTS.includes(variant)) {
    variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
    localStorage.setItem(STORAGE_KEY, variant)
  }

  return variant
}
