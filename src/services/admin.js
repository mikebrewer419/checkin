import { api_host, token } from './consts'

export const getNotification = async () => {
  const resp = await fetch(`${api_host}/admin/notification`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateNotification = async (data) => {
  const resp = await fetch(`${api_host}/admin/notification`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getServices = async () => {
  const resp = await fetch(`${api_host}/admin/autoscaling-info`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateAutoScalingGroup = async (data) => {
  const resp = await fetch(`${api_host}/admin/update-autoscaling-capacity`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}