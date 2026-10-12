import request from '@/utils/request'

// --- TOTP 两步验证 ---

export function setupTOTP() {
  return request({
    url: '/user/totp/setup',
    method: 'post'
  })
}

export function verifyTOTP(code) {
  return request({
    url: '/user/totp/verify',
    method: 'post',
    data: { code }
  })
}

export function disableTOTP(password) {
  return request({
    url: '/user/totp/disable',
    method: 'post',
    data: { password }
  })
}

export function loginTOTP(ticket, code) {
  return request({
    url: '/auth/totp/login',
    method: 'post',
    data: { ticket, code }
  })
}

// --- WebAuthn 通行密钥 (Passkey) ---

export function getPasskeyRegisterBegin() {
  return request({
    url: '/webauthn/register/begin',
    method: 'post'
  })
}

export function postPasskeyRegisterFinish(sessionId, name, payload) {
  return request({
    url: `/webauthn/register/finish?session_id=${encodeURIComponent(sessionId)}&name=${encodeURIComponent(name || '')}`,
    method: 'post',
    data: payload
  })
}

export function getPasskeyLoginBegin(username) {
  const url = username
    ? `/webauthn/login/begin?username=${encodeURIComponent(username)}`
    : '/webauthn/login/begin'
  return request({
    url,
    method: 'post'
  })
}

export function postPasskeyLoginFinish(sessionId, payload) {
  return request({
    url: `/webauthn/login/finish?session_id=${encodeURIComponent(sessionId)}`,
    method: 'post',
    data: payload
  })
}

export function listPasskeys() {
  return request({
    url: '/webauthn/credentials',
    method: 'get'
  })
}

export function deletePasskey(id) {
  return request({
    url: '/webauthn/credentials/delete',
    method: 'post',
    data: { id }
  })
}

// --- 数据库备份 ---

export function backupDatabase() {
  return request({
    url: '/admin/backup/database',
    method: 'post',
    responseType: 'blob'
  })
}
