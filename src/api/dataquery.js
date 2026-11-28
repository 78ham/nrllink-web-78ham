import request from '@/utils/request'

export function fetchTotalStats(data) {
  return request({
    url: '/platform/totalstats',
    method: 'post',
    data
  })
}
