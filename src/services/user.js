import { api_host, token } from './index'

export const listUsers = async (query = '', userType='', skip = 0, limit = 20) => {
  const resp = await fetch(`${api_host}/auth/admin/users?email=${query}&user_type=${userType}&skip=${skip}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const deleteUser = async (id) => {
  const resp = await fetch(`${api_host}/auth/admin/delete-user/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}
