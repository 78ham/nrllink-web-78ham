import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPerfMetrics, initPerfMonitoring } from '@/utils/perf'

describe('perf.js Web Vitals Monitoring', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial metrics object', () => {
    const metrics = getPerfMetrics()
    expect(metrics).toHaveProperty('fcp')
    expect(metrics).toHaveProperty('lcp')
    expect(metrics).toHaveProperty('cls')
    expect(metrics).toHaveProperty('inp')
  })

  it('should initialize and register observers without throwing', () => {
    const reports = []
    expect(() => {
      initPerfMonitoring({
        onReport: (name, val) => {
          reports.push({ name, val })
        }
      })
    }).not.toThrow()
  })
})
