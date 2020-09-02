import { api_host, token } from './index'
import { getUser } from './auth'

export const getStudioSessions = (studio_id) => {
  return fetch(`${api_host}/sessions/by-studio/${studio_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getOneSession = (session_id) => {
  return fetch(`${api_host}/sessions/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  }).then((resp) => resp.json())
}

export const updateSession = (id, fields) => {
  return fetch(`${api_host}/sessions/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

export const deleteSession = (id) => {
  return fetch(`${api_host}/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const createSession = (fields) => {
  return fetch(`${api_host}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

export const listByManager = (page, page_size) => {
  return fetch(`${api_host}/sessions/by-manager?skip=${page * page_size}&take=${page_size}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  }).then((resp) => resp.json())
}

export const getManagers = (id) => {
  return fetch(`${api_host}/sessions/get-managers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  }).then((resp) => resp.json())
}

export const assignManagers = (id, manager_ids) => {
  return fetch(`${api_host}/sessions/assign-managers/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ session_managers: manager_ids })
  }).then((resp) => resp.json())
}
