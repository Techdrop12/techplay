export function setupErrorLogger() {
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Frontend Error:', { message, source, lineno, colno, error })
      // TODO: send to monitoring endpoint if needed
    }
  }
}