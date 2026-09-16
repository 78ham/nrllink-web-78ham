import request from '@/utils/request'

export function fetchBMNetworks(params) {
  return request({
    url: '/bm/network/list',
    method: 'get',
    params
  })
}

export function createBMNetwork(data) {
  return request({
    url: '/bm/network/create',
    method: 'post',
    data
  })
}

export function updateBMNetwork(data) {
  return request({
    url: '/bm/network/update',
    method: 'post',
    data
  })
}

export function deleteBMNetwork(data) {
  return request({
    url: '/bm/network/delete',
    method: 'post',
    data
  })
}

export function startBMBridge(data) {
  return request({
    url: '/bm/bridge/start',
    method: 'post',
    data
  })
}

export function stopBMBridge(data) {
  return request({
    url: '/bm/bridge/stop',
    method: 'post',
    data
  })
}

export function fetchBMBridgeStatus(params) {
  return request({
    url: '/bm/bridge/status',
    method: 'get',
    params
  })
}
