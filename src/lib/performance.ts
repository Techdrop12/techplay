export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    console.log(`[Perf] ${metric.name}: ${metric.value}`)
  }
}
