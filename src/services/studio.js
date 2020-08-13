import { api_host, token } from './index'

export const getAllStudios = () => {
  return fetch(`${api_host}/studio/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getManyStudios = (page = 0, page_size = 10) => {
  return fetch(`${api_host}/studio/get-many?skip=${page * page_size}&take=${page_size}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const generateNewJitsiKey = () => {
  return fetch(`${api_host}/studio/generate-jitsi-key`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const createOrUpdateStudio = (studio) => {
  const formData = new FormData()
  if (studio.logo) {
    formData.append('logo', studio.logo)
  }

  Object.keys(studio).forEach(key => {
    if (key === 'logo') return
    formData.append(key, JSON.stringify(studio[key]))
  })

  const url = studio._id
    ? `${api_host}/studio/${studio._id}`
    : `${api_host}/studio/`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }).then((resp) => resp.json())
}

export const deleteStudio = (studio_id) => {
  return fetch(`${api_host}/studio/${studio_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getStudioInfo = (studio_id) => {
  return fetch(`${api_host}/studio/${studio_id}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  }).then((resp) => resp.json())
}

export const getStudioByUri = (studio_name) => {
  return fetch(`${api_host}/studio/uri/${studio_name}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const createCometRoom = (id, session_id) => {
  return fetch(`${api_host}/studio/comet-chat/${id}/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.text())
}


export const sendMessage = (message, studio_id, record_id = '') => {
  return fetch(api_host+`/studio/message/${studio_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...message,
      record_id
    })
  }).then(res => res.json())
}
