// 统一的三态设备识别：mobile / tablet / desktop
// 与 src/styles/variables.scss 的 $bp-mobile / $bp-tablet 保持一致
export const BREAKPOINT = {
  mobile: 768,
  tablet: 1024
}

export const DEVICE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
}

/**
 * 判定当前设备类型
 * 规则：
 *  1. 宽度 < 768            -> mobile
 *  2. iPadOS（Macintosh UA + maxTouchPoints > 1）-> tablet
 *  3. 触屏且宽度 < 1024     -> tablet
 *  4. 其余                  -> desktop
 */
export function detectDevice() {
  const width = document.documentElement.clientWidth
  const ua = navigator.userAgent || ''
  const isTouch = typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1

  if (width < BREAKPOINT.mobile) return DEVICE.MOBILE
  if (isIPadOS) return DEVICE.TABLET
  if (isTouch && width < BREAKPOINT.tablet) return DEVICE.TABLET
  return DEVICE.DESKTOP
}

/** 是否运行在 PWA 独立窗口模式 */
export function isStandalone() {
  const mq = typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  return !!mq || window.navigator.standalone === true
}

/** 是否为触摸优先设备（用于触控样式分支） */
export function isTouchPrimary() {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
}
