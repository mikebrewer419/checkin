import { api_host, token } from './index'

export const getNotification = async () => {
  const resp = await fetch(`${api_host}/admin/notification`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateNotification = async (text) => {
  const resp = await fetch(`${api_host}/admin/notification`, {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}
