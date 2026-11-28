import request from '@/utils/request'

export function fetchGroupList(data) {
  return request({
    url: '/group/list',
    method: 'post',
    data
  })
}

export function fetchGroupDevicesList(data) {
  return request({
    url: '/group/device/list',
    method: 'post',
    data
  })
}

export function fetchGroupListMini(data) {
  return request({
    url: '/group/list/mini',
    method: 'post',
    data
  }).then(response => {
    // Older backends returned the group array directly.
    const groups = Array.isArray(response.data) ? response.data : response.data?.items
    return Array.isArray(groups) ? groups : []
  })
}

export function createGroup(data) {
  return request({
    url: '/group/create',
    method: 'post',
    data
  })
}

export function updateGroup(data) {
  return request({
    url: '/group/update',
    method: 'post',
    data
  })
}

export function deleteGroup(data) {
  return request({
    url: '/group/delete',
    method: 'post',
    data
  })
}

