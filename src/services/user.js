import { api_host, token } from './consts'
import { obj2Query } from '../utils'

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

export const apiListFreelancers = async (data) =>{
  try {
    const resp = await fetch(`${api_host}/auth/users/freelancers?${obj2Query(data)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (resp.ok) {
      return resp.json()
    } else {
      throw resp
    }
  } catch (error) {
    throw error
  }
}