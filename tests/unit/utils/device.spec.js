import { describe, expect, it, vi, beforeEach } from 'vitest'
import { detectDevice, DEVICE, BREAKPOINT, isStandalone, isTouchPrimary } from '@/utils/device'

function mockEnv({ width, ua = '', coarse = false, maxTouchPoints = 0, standalone = false }) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: width
  })
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: maxTouchPoints
  })
  window.matchMedia = vi.fn().mockImplementation((q) => ({
    matches: q === '(pointer: coarse)' ? coarse : q === '(display-mode: standalone)' ? standalone : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
}

describe('utils/device', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns mobile below breakpoint', () => {
    mockEnv({ width: BREAKPOINT.mobile - 1 })
    expect(detectDevice()).toBe(DEVICE.MOBILE)
  })

  it('returns tablet for iPadOS', () => {
    mockEnv({ width: 900, ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', maxTouchPoints: 5 })
    expect(detectDevice()).toBe(DEVICE.TABLET)
  })

  it('returns tablet for touch device below 1024', () => {
    mockEnv({ width: 900, coarse: true })
    expect(detectDevice()).toBe(DEVICE.TABLET)
  })

  it('returns desktop for wide non-touch screen', () => {
    mockEnv({ width: 1440 })
    expect(detectDevice()).toBe(DEVICE.DESKTOP)
  })

  it('evaluates exact 1440, 768, 393, 375 viewport widths correctly', () => {
    mockEnv({ width: 1440 })
    expect(detectDevice()).toBe(DEVICE.DESKTOP)

    mockEnv({ width: 768, coarse: true })
    expect(detectDevice()).toBe(DEVICE.TABLET)

    mockEnv({ width: 393 })
    expect(detectDevice()).toBe(DEVICE.MOBILE)

    mockEnv({ width: 375 })
    expect(detectDevice()).toBe(DEVICE.MOBILE)
  })

  it('identifies standalone mode', () => {
    mockEnv({ width: 1440, standalone: true })
    expect(isStandalone()).toBe(true)
  })

  it('identifies touch primary devices', () => {
    mockEnv({ width: 1440, coarse: true })
    expect(isTouchPrimary()).toBe(true)
  })
})
