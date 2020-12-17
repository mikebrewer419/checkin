import { api_host, token } from './index'

export const getAllStudios = async () => {
  const resp = await fetch(`${api_host}/studio/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getManyStudios = async (page = 0, page_size = 10) => {
  const resp = await fetch(`${api_host}/studio/get-many?skip=${page * page_size}&take=${page_size}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const generateNewJitsiKey = async () => {
  const resp = await fetch(`${api_host}/studio/generate-jitsi-key`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const generateNewProjectUri = async () => {
  const resp = await fetch(`${api_host}/studio/generate-project-uri`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const createOrUpdateStudio = async (studio) => {
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
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const deleteStudio = async (studio_id) => {
  const resp = await fetch(`${api_host}/studio/${studio_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getStudioInfo = async (studio_id) => {
  const resp = await fetch(`${api_host}/studio/${studio_id}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
  const project = await resp.json()
  // Casting director logo handle
  if (!project.logo && project.casting_directors.length > 0) {
    project.logo = project.casting_directors[0].logo
  }
  return project
}

export const getStudioByUri = async (studio_name) => {
  const resp = await fetch(`${api_host}/studio/uri/${studio_name}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const createCometRoom = async (id, session_id) => {
  const resp = await fetch(`${api_host}/studio/comet-chat/${id}/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.text()
}


export const sendMessage = async (message, studio_id, record_id = '') => {
  const res = await fetch(api_host + `/studio/message/${studio_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: message.to,
      body: message.body + ' *Do Not Reply*',
      record_id
    })
  })
  return await res.json()
}

export const assignCastingDirector = (id, director_ids) => {
  return fetch(api_host+`/studio/assign-director/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({casting_directors: director_ids})
  })
}
