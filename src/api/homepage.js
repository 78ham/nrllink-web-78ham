import request from '@/utils/request'

export function fetchHomepageSections() {
  return request({
    url: '/api/homepage/sections',
    method: 'get'
  })
}

export function fetchHomepageAnnouncements(params) {
  return request({
    url: '/api/homepage/announcements',
    method: 'get',
    params
  })
}

export function fetchHomepageAnnouncement(id) {
  return request({
    url: '/api/homepage/announcements',
    method: 'get',
    params: { id }
  })
}

export function fetchAdminSections() {
  return request({
    url: '/api/admin/homepage/sections',
    method: 'get'
  })
}

export function updateAdminSection(data) {
  return request({
    url: '/api/admin/homepage/sections/update',
    method: 'post',
    data
  })
}

export function deleteAdminSection(data) {
  return request({
    url: '/api/admin/homepage/sections/delete',
    method: 'post',
    data
  })
}

export function createAnnouncement(data) {
  return request({
    url: '/api/admin/homepage/announcements/create',
    method: 'post',
    data
  })
}

export function updateAnnouncement(data) {
  return request({
    url: '/api/admin/homepage/announcements/update',
    method: 'post',
    data
  })
}

export function deleteAnnouncement(data) {
  return request({
    url: '/api/admin/homepage/announcements/delete',
    method: 'post',
    data
  })
}

export function uploadHomepageImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/admin/homepage/images/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function fetchHomepageImages() {
  return request({
    url: '/api/admin/homepage/images/list',
    method: 'get'
  })
}

export function deleteHomepageImage(data) {
  return request({
    url: '/api/admin/homepage/images/delete',
    method: 'post',
    data
  })
}
