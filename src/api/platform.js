import request from '@/utils/request'

export function getplatforminfo() {
  return request({
    url: '/platform/info',
    method: 'get'
  })
}

export function fetchPlatformList(data) {
  return request({
    url: '/platform/list',
    method: 'post',
    data
  })
}


export function fetchSiteSettings() {
 return request({
  url: '/platform/site-settings',
  method: 'get'
 })
}

export function updateSiteSettings(data) {
 return request({
  url: '/platform/site-settings/update',
  method: 'post',
  data
 })
}
