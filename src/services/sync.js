import { token } from './index'
const sync_app_url = 'http://localhost:8888'

export const checkSyncAppStatus = async () => {
  const resp = await fetch(`${sync_app_url}/status`)
  return await resp.json()
}

export const checkSync = async (email, sessionId) => {
  const resp = await fetch(`${sync_app_url}/check-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, session_id: sessionId
    })
  })
  return await resp.json()
}

export const setAppSync = async (email, sessionId, sessionName, sync) => {
  const resp = await fetch(`${sync_app_url}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      session_id: sessionId,
      sync,
      token,
      session_name: sessionName,
      page_url: window.location.href
    })
  })
  return await resp.json()
}
