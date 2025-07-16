export const trackPixel = (event: string) => {
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', event)
  }
}
