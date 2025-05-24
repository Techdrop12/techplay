export async function fetchUnsplashImage(keyword) {
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`)
    const data = await response.json()
    return data?.urls?.regular || '/default-image.jpg'
  } catch {
    return '/default-image.jpg'
  }
}
