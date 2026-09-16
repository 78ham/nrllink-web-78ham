import request from '@/utils/request'

export function fetchBMNetworks(params, config = {}) {
  return request({
    url: '/bm/network/list',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}

export function createBMNetwork(data, config = {}) {
  return request({
    url: '/bm/network/create',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function updateBMNetwork(data, config = {}) {
  return request({
    url: '/bm/network/update',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function deleteBMNetwork(data, config = {}) {
  return request({
    url: '/bm/network/delete',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function startBMBridge(data, config = {}) {
  return request({
    url: '/bm/bridge/start',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function stopBMBridge(data, config = {}) {
  return request({
    url: '/bm/bridge/stop',
    method: 'post',
    data,
    silent: true,
    ...config
  })
}

export function fetchBMBridgeStatus(params, config = {}) {
  return request({
    url: '/bm/bridge/status',
    method: 'get',
    params,
    silent: true,
    ...config
  })
}
