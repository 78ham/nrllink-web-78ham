import request from '@/utils/request'

// BM 网络接口走后端注册的 /api 别名（http.go 中 /api/bm/*），
// nginx /api 前缀同源转发；裸 /bm/* 不在白名单内
async function requestBM(config) {
  const result = await request(config)
  if (result.code !== 20000) {
    throw new Error(result.data?.message || result.message || 'BM API error')
  }
  return result
}

export function fetchBMNetworks(params, config = {}) {
  return requestBM({
    url: '/api/bm/network/list',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}

export function createBMNetwork(data, config = {}) {
  return requestBM({
    url: '/api/bm/network/create',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function updateBMNetwork(data, config = {}) {
  return requestBM({
    url: '/api/bm/network/update',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function deleteBMNetwork(data, config = {}) {
  return requestBM({
    url: '/api/bm/network/delete',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function startBMBridge(data, config = {}) {
  return requestBM({
    url: '/api/bm/start',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function stopBMBridge(data, config = {}) {
  return requestBM({
    url: '/api/bm/stop',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function fetchBMBridgeStatus(params, config = {}) {
  return requestBM({
    url: '/api/bm/status',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}
