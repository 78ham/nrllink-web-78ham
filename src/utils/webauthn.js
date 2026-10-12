// WebAuthn 通行密钥编解码工具函数（原生无第三方依赖）

export function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const binary = atob(base64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function transformCreationOptions(options) {
  const pk = options.publicKey || options
  const transformed = { ...pk }

  if (typeof pk.challenge === 'string') {
    transformed.challenge = base64urlToBuffer(pk.challenge)
  }
  if (pk.user && typeof pk.user.id === 'string') {
    transformed.user = {
      ...pk.user,
      id: base64urlToBuffer(pk.user.id)
    }
  }
  if (Array.isArray(pk.excludeCredentials)) {
    transformed.excludeCredentials = pk.excludeCredentials.map(c => ({
      ...c,
      id: typeof c.id === 'string' ? base64urlToBuffer(c.id) : c.id
    }))
  }

  return { publicKey: transformed }
}

export function transformAssertionOptions(options) {
  const pk = options.publicKey || options
  const transformed = { ...pk }

  if (typeof pk.challenge === 'string') {
    transformed.challenge = base64urlToBuffer(pk.challenge)
  }
  if (Array.isArray(pk.allowCredentials)) {
    transformed.allowCredentials = pk.allowCredentials.map(c => ({
      ...c,
      id: typeof c.id === 'string' ? base64urlToBuffer(c.id) : c.id
    }))
  }

  return { publicKey: transformed }
}

export function serializeCreationResponse(cred) {
  const resp = cred.response
  return {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    type: cred.type,
    response: {
      attestationObject: bufferToBase64url(resp.attestationObject),
      clientDataJSON: bufferToBase64url(resp.clientDataJSON)
    }
  }
}

export function serializeAssertionResponse(cred) {
  const resp = cred.response
  return {
    id: cred.id,
    rawId: bufferToBase64url(cred.rawId),
    type: cred.type,
    response: {
      authenticatorData: bufferToBase64url(resp.authenticatorData),
      clientDataJSON: bufferToBase64url(resp.clientDataJSON),
      signature: bufferToBase64url(resp.signature),
      userHandle: resp.userHandle ? bufferToBase64url(resp.userHandle) : null
    }
  }
}
