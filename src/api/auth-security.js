import request from '@/utils/request'

// 安全相关接口统一走 /api/v1 前缀（后端 http.go 只在 /api/v1 下注册这批路由，
// 调裸路径会 404；/api 前缀由 nginx 同源转发，无需额外配置）

// --- TOTP 两步验证 ---

export function setupTOTP() {
  return request({
    url: '/api/v1/user/totp/setup',
    method: 'post'
  })
}

export function verifyTOTP(code) {
  return request({
    url: '/api/v1/user/totp/verify',
    method: 'post',
    data: { code }
  })
}

export function disableTOTP(password) {
  return request({
    url: '/api/v1/user/totp/disable',
    method: 'post',
    data: { password }
  })
}

export function loginTOTP(ticket, code) {
  return request({
    url: '/api/v1/auth/totp/login',
    method: 'post',
    data: { ticket, code }
  })
}

// --- WebAuthn 通行密钥 (Passkey) ---

export function getPasskeyRegisterBegin() {
  return request({
    url: '/api/v1/webauthn/register/begin',
    method: 'post'
  })
}

export function postPasskeyRegisterFinish(sessionId, name, payload) {
  return request({
    url: `/api/v1/webauthn/register/finish?session_id=${encodeURIComponent(sessionId)}&name=${encodeURIComponent(name || '')}`,
    method: 'post',
    data: payload
  })
}

export function getPasskeyLoginBegin(username) {
  const url = username
    ? `/api/v1/webauthn/login/begin?username=${encodeURIComponent(username)}`
    : '/api/v1/webauthn/login/begin'
  return request({
    url,
    method: 'post'
  })
}

export function postPasskeyLoginFinish(sessionId, payload) {
  return request({
    url: `/api/v1/webauthn/login/finish?session_id=${encodeURIComponent(sessionId)}`,
    method: 'post',
    data: payload
  })
}

export function listPasskeys() {
  return request({
    url: '/api/v1/webauthn/credentials',
    method: 'get'
  })
}

export function deletePasskey(id) {
  return request({
    url: '/api/v1/webauthn/credentials/delete',
    method: 'post',
    data: { id }
  })
}

// --- 数据库备份 ---
// responseType: 'blob' 时 request.js 对 application/octet-stream 直接放行，
// 失败信封（JSON）会被解析后走统一错误提示

export function backupDatabase() {
  return request({
    url: '/api/v1/admin/backup/database',
    method: 'post',
    responseType: 'blob',
    silent: true
  })
}
