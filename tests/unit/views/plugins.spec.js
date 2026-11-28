import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/utils/request', () => ({ default: vi.fn() }))
vi.mock('@/utils/auth', () => ({ getToken: vi.fn(() => '') }))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

import { flushPromises } from '@vue/test-utils'
import request from '@/utils/request'
import * as pluginsApi from '@/api/plugins'
import PluginManagementPage from '@/views/setup/plugins.vue'
import zh from '@/lang/zh'
import en from '@/lang/en'

describe('Plugin Management', () => {
  beforeEach(() => {
    request.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports all required plugin API methods', () => {
    expect(typeof pluginsApi.fetchPluginList).toBe('function')
    expect(typeof pluginsApi.enablePlugin).toBe('function')
    expect(typeof pluginsApi.disablePlugin).toBe('function')
    expect(typeof pluginsApi.fetchPluginConfig).toBe('function')
    expect(typeof pluginsApi.updatePluginConfig).toBe('function')
    expect(typeof pluginsApi.fetchBridgeStatus).toBe('function')
  })

  it('calls the documented /api/v1 plugin endpoints', async() => {
    request.mockResolvedValue({ code: 20000, data: {} })

    await pluginsApi.fetchPluginList()
    await pluginsApi.enablePlugin('bridge')
    await pluginsApi.disablePlugin('bridge')
    await pluginsApi.fetchPluginConfig('bridge')
    await pluginsApi.updatePluginConfig('bridge', { bridges: [] })
    await pluginsApi.fetchBridgeStatus()

    const urls = request.mock.calls.map(call => call[0].url)
    expect(urls).toEqual([
      '/api/v1/plugins',
      '/api/v1/plugins/enable',
      '/api/v1/plugins/disable',
      '/api/v1/plugins/config',
      '/api/v1/plugins/config/update',
      '/api/v1/plugins/bridge/status'
    ])
    expect(request.mock.calls[1][0].data).toEqual({ name: 'bridge' })
    expect(request.mock.calls[3][0].params).toEqual({ name: 'bridge' })
    expect(request.mock.calls[4][0].data).toEqual({ name: 'bridge', config: { bridges: [] } })
  })

  it('has valid component options and initial data', () => {
    expect(PluginManagementPage.name).toBe('PluginManagementPage')
    const data = PluginManagementPage.data()
    expect(Array.isArray(data.pluginList)).toBe(true)
    expect(data.bridgeRunning).toBe(false)
    expect(Array.isArray(data.bridgeStatusList)).toBe(true)
  })

  it('loads plugin list into state', async() => {
    request.mockResolvedValueOnce({
      code: 20000,
      data: {
        total: 2,
        items: [
          { name: 'aprs', description: 'a', enabled: true, running: true },
          { name: 'bridge', description: 'b', enabled: false, running: false }
        ]
      }
    })
    const page = PluginManagementPage.data()
    PluginManagementPage.methods.loadPlugins.call(page)
    await flushPromises()
    expect(page.pluginList).toHaveLength(2)
    expect(page.pluginList[0].name).toBe('aprs')
  })

  it('shows the bridge panel only when the bridge plugin is enabled or running', () => {
    const page = PluginManagementPage.data()
    expect(PluginManagementPage.computed.bridgePanelVisible.call(page)).toBe(false)

    page.pluginList = [{ name: 'bridge', enabled: true, running: false }]
    expect(PluginManagementPage.computed.bridgePanelVisible.call(page)).toBe(true)

    page.pluginList = [{ name: 'bridge', enabled: false, running: false }]
    expect(PluginManagementPage.computed.bridgePanelVisible.call(page)).toBe(false)
  })

  it('validates bridge form rows before saving', () => {
    const page = PluginManagementPage.data()
    page.bridgeForm = {
      bridges: [{
        name: 'bm-4601',
        type: 'nrl',
        remote_host: '1.2.3.4',
        remote_port: 60050,
        local_group_id: 5,
        bridge_callsign: 'BRIDG1',
        bridge_ssid: 88,
        codec: 1,
        tx_enabled: true,
        rx_enabled: true,
        max_duration_sec: 120,
        hook_priority: 50
      }]
    }
    expect(PluginManagementPage.methods.validateBridgeForm.call(page)).toBe('')

    page.bridgeForm.bridges[0].remote_host = ''
    expect(PluginManagementPage.methods.validateBridgeForm.call(page)).toBe('bridgeRowIncomplete')

    page.bridgeForm.bridges[0].remote_host = '1.2.3.4'
    page.bridgeForm.bridges[0].bridge_callsign = 'NO!'
    expect(PluginManagementPage.methods.validateBridgeForm.call(page)).toBe('bridgeCallsignInvalid')

    page.bridgeForm.bridges[0].bridge_callsign = 'BRIDG1'
    page.bridgeForm.bridges[0].local_group_id = null
    expect(PluginManagementPage.methods.validateBridgeForm.call(page)).toBe('bridgeGroupRequired')
  })

  it('rejects non-object JSON config before calling the API', async() => {
    request.mockResolvedValue({ code: 20000, data: { message: 'ok' } })
    const page = PluginManagementPage.data()
    page.editingPluginName = 'aprs'
    page.configText = '[1,2,3]'
    page.$t = key => key

    PluginManagementPage.methods.handleSaveConfig.call(page)
    expect(request).not.toHaveBeenCalled()
    expect(page.configParseError).not.toBe('')
  })

  it('contains complete i18n keys for the plugin module', () => {
    expect(zh.route.plugins).toBe('插件管理')
    expect(en.route.plugins).toBe('Plugins')
    expect(zh.plugin.running).toBe('运行中')
    expect(en.plugin.running).toBe('Running')
    expect(zh.plugin.names.bridge).toBe('语音桥接')
    expect(en.plugin.names.bridge).toBe('Voice Bridge')
  })
})
