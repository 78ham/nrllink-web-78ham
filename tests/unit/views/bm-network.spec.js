import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/request', () => ({ default: vi.fn() }))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

import { flushPromises } from '@vue/test-utils'
import request from '@/utils/request'
import * as bmApi from '@/api/bm'
import BMNetworkPage from '@/views/pub/bm-network.vue'
import zh from '@/lang/zh'
import en from '@/lang/en'

describe('BM Network Management', () => {
  it('should export all required BM API methods', () => {
    expect(typeof bmApi.fetchBMNetworks).toBe('function')
    expect(typeof bmApi.createBMNetwork).toBe('function')
    expect(typeof bmApi.updateBMNetwork).toBe('function')
    expect(typeof bmApi.deleteBMNetwork).toBe('function')
    expect(typeof bmApi.startBMBridge).toBe('function')
    expect(typeof bmApi.stopBMBridge).toBe('function')
    expect(typeof bmApi.fetchBMBridgeStatus).toBe('function')
  })

  it('should have valid component options and initial data in bm-network.vue', () => {
    expect(BMNetworkPage.name).toBe('BMNetworkPage')
    expect(typeof BMNetworkPage.data).toBe('function')
    const data = BMNetworkPage.data()
    expect(data.bridgeStatus).toBeDefined()
    expect(data.bridgeStatus.status).toBe(0)
    expect(Array.isArray(data.networkList)).toBe(true)
    expect(Array.isArray(data.networkColumns)).toBe(true)
  })

  it('keeps an empty live network list distinct from demo configurations', async() => {
    const page = BMNetworkPage.data()
    request.mockResolvedValueOnce({ code: 20000, data: { items: [] }})
    BMNetworkPage.methods.loadNetworks.call(page)
    await flushPromises()
    expect(page.networkList).toEqual([])
    expect(page.isDemoMode).toBe(false)
    expect(page.selectedNetworkId).toBeUndefined()
  })

  it('rejects a failed BM operation even when HTTP succeeds', async() => {
    request.mockResolvedValueOnce({ code: 20001, data: { message: '保存失败' }})
    await expect(bmApi.updateBMNetwork({ id: 1 })).rejects.toThrow('保存失败')
  })

  it('should contain complete i18n keys for BM network', () => {
    expect(zh.route.bmNetwork).toBe('BM网络管理')
    expect(en.route.bmNetwork).toBe('BM Network')
    expect(zh.bm).toBeDefined()
    expect(zh.bm.title).toBe('BM 网络管理')
    expect(en.bm).toBeDefined()
    expect(en.bm.title).toBe('BM Network Management')
  })
})
