import { api_host, token } from './index'
import { getUser } from './auth'

export const getStudioSessions = async (studio_id) => {
  const resp = await fetch(`${api_host}/sessions/by-studio/${studio_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getOneSession = async (session_id) => {
  const resp = await fetch(`${api_host}/sessions/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  return await resp.json()
}

export const updateSession = async (id, fields) => {
  const resp = await fetch(`${api_host}/sessions/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const deleteSession = async (id) => {
  const resp = await fetch(`${api_host}/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const createSession = async (fields) => {
  const resp = await fetch(`${api_host}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const listByManager = async (page, page_size) => {
  const resp = await fetch(`${api_host}/sessions/by-manager?skip=${page * page_size}&take=${page_size}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })
  return await resp.json()
}

export const getManagers = async (id) => {
  const resp = await fetch(`${api_host}/sessions/get-managers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })
  return await resp.json()
}

export const assignManagers = async (id, manager_ids) => {
  const resp = await fetch(`${api_host}/sessions/assign-managers/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ session_managers: manager_ids })
  })
  return await resp.json()
}
