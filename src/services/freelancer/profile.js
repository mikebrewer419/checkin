import { api_host, token } from '../consts'
import { obj2Query } from '../../utils'
export const getProfileByUser = async (user_id) => {
  try {
    const resp = await fetch(`${api_host}/freelancer/profile/by-user/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return await resp.json()  
  } catch (error) {
    return null
  }
  
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
  try {
    const resp = await fetch(`${api_host}/freelancer/profile/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fields)
    })
    if (resp.ok) {
      return await resp.json()  
    } else {
      throw resp
    }
      
  } catch (error) {
    throw error
  }
  
}

export const listProfiles = async (data) => {
  try {
    const resp = await fetch(`${api_host}/freelancer/profile?${obj2Query(data)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (resp.ok) {
      return await resp.json()  
    } else {
      throw resp
    }
    
  } catch (error) {
    throw error
  }
  
}