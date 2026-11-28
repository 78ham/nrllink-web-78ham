import request from '@/utils/request'

// 插件管理接口：后端仅注册在 /api/v1 前缀下（admin 角色），见 doc/plugin-frontend-api.md
// 响应统一 {"code":20000,"data":{...}}，code!=20000 时 request.js 拦截器统一弹错

export function fetchPluginList() {
  return request({
    url: '/api/v1/plugins',
    method: 'get'
  })
}

export function enablePlugin(name) {
  return request({
    url: '/api/v1/plugins/enable',
    method: 'post',
    data: { name }
  })
}

export function disablePlugin(name) {
  return request({
    url: '/api/v1/plugins/disable',
    method: 'post',
    data: { name }
  })
}

export function fetchPluginConfig(name) {
  return request({
    url: '/api/v1/plugins/config',
    method: 'get',
    params: { name }
  })
}

export function updatePluginConfig(name, config) {
  return request({
    url: '/api/v1/plugins/config/update',
    method: 'post',
    data: { name, config }
  })
}

// 桥接插件运行状态：GET /api/v1/plugins/bridge/status
// {"code":20000,"data":{"running":true,"items":[{name,connected,rx_packets,tx_packets,dropped,last_error,last_active}]}}
// 轮询接口静默失败，由页面自行降级，避免错误提示刷屏
export function fetchBridgeStatus() {
  return request({
    url: '/api/v1/plugins/bridge/status',
    method: 'get',
    silent: true
  })
}
