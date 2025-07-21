export const sendEvent = (eventName: string, eventParams = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams)
  }
}

export const pageview = (url: string) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    process.env.NEXT_PUBLIC_GA_ID
  ) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    })
  }
}
