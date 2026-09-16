/**
 * Performance monitoring utility for Core Web Vitals (FCP, LCP, CLS, INP)
 */

const metrics = {
  fcp: null,
  lcp: null,
  cls: 0,
  inp: null
}

let isInitialized = false

export function getPerfMetrics() {
  return { ...metrics }
}

export function initPerfMonitoring(options = {}) {
  if (isInitialized) return
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  isInitialized = true
  const isDev = import.meta.env?.DEV
  const onReport = options.onReport || ((name, value) => {
    if (isDev) {
      console.log(`[Web Vitals] ${name}:`, value)
    }
  })

  // 1. First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = Math.round(entry.startTime)
          onReport('FCP', metrics.fcp)
          fcpObserver.disconnect()
        }
      }
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
  } catch {
    // Ignore unsupported observers
  }

  // 2. Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        metrics.lcp = Math.round(lastEntry.startTime)
        onReport('LCP', metrics.lcp)
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    // Ignore unsupported observers
  }

  // 3. Cumulative Layout Shift (CLS)
  try {
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          metrics.cls = Number((metrics.cls + entry.value).toFixed(4))
          onReport('CLS', metrics.cls)
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch {
    // Ignore unsupported observers
  }

  // 4. Interaction to Next Paint (INP) / First Input Delay fallback
  try {
    const inpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const duration = Math.round(entry.duration || (entry.processingEnd - entry.startTime))
        if (!metrics.inp || duration > metrics.inp) {
          metrics.inp = duration
          onReport('INP', metrics.inp)
        }
      }
    })
    inpObserver.observe({ type: 'first-input', buffered: true })
  } catch {
    // Ignore unsupported observers
  }
}
