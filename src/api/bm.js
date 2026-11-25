import request from '@/utils/request'

async function requestBM(config) {
  const result = await request(config)
  if (result.code !== 20000) {
    throw new Error(result.data?.message || result.message || 'BM API error')
  }
  return result
}

export function fetchBMNetworks(params, config = {}) {
  return requestBM({
    url: '/bm/network/list',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}

export function createBMNetwork(data, config = {}) {
  return requestBM({
    url: '/bm/network/create',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function updateBMNetwork(data, config = {}) {
  return requestBM({
    url: '/bm/network/update',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function deleteBMNetwork(data, config = {}) {
  return requestBM({
    url: '/bm/network/delete',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function startBMBridge(data, config = {}) {
  return requestBM({
    url: '/bm/bridge/start',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function stopBMBridge(data, config = {}) {
  return requestBM({
    url: '/bm/bridge/stop',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function fetchBMBridgeStatus(params, config = {}) {
  return requestBM({
    url: '/bm/bridge/status',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}
