import request from '@/utils/request'

export function fetchEmployeeList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

export function fetchEmployeeAllList(data) {
  return request({
    url: '/user/alllist',
    method: 'post',
    data
  })
}

export function fetchEmployeeListsByRole(role) {
  return request({
    url: '/user/userlistbyrole',
    method: 'get',
    params: { role }
  })
}

export function createEmployee(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function updateEmployee(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function deleteEmployee(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}
