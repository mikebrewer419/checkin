import { api_host, token } from '../index'

export const getProfileByUser = async (user_id) => {
  const resp = await fetch(`${api_host}/freelancer/profile/${user_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const createProfile = async (fields) => {
  const resp = await fetch(`${api_host}/freelancer/profile/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const updateProfile = async (id, fields) => {
  const resp = await fetch(`${api_host}/freelancer/profile/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}
