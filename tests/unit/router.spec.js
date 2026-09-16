import { describe, it, expect, vi } from 'vitest'

vi.mock('@/layout/index.vue', () => ({
  default: { name: 'Layout', render: () => null }
}))

import { constantRoutes } from '@/router'

describe('router tombstone test', () => {
  it('should have a tombstone redirect for /chat to /dashboard', () => {
    const chatRoute = constantRoutes.find(route => route.path === '/chat')
    expect(chatRoute).toBeDefined()
    expect(chatRoute.redirect).toBe('/dashboard')
    expect(chatRoute.hidden).toBe(true)

    const childIndex = chatRoute.children?.find(child => child.path === 'index')
    expect(childIndex).toBeDefined()
    expect(childIndex.redirect).toBe('/dashboard')
  })
})
