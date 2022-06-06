import { api_host, token } from '../consts'
import { obj2Query } from '../../utils'

export const listRequests = async (filter) => {
  try {
    const resp = await fetch(`${api_host}/freelancer/request/?${obj2Query(filter)}`, {
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

export const createRequest = async (session, requested_person) => {
  try{
    const resp = await fetch(`${api_host}/freelancer/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({session, requested_person})
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

export const updateRequest = async (id, data) => {
  try{
    const resp = await fetch(`${api_host}/freelancer/request/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
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
