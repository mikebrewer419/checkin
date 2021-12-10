import { api_host, token } from './index'

export const getSessionVideos = async (session_id) => {
  const resp = await fetch(`${api_host}/videos/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getGroupVideos = async (group_id) => {
  const resp = await fetch(`${api_host}/videos/by-group/${group_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getArchivedSessionVideos = async (session_id) => {
  const resp = await fetch(`${api_host}/videos/archived/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const deleteVideo = async (video_id) => {
  const resp = await fetch(`${api_host}/videos/${video_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateVideo = async (video_id, fields) => {
  const resp = await fetch(`${api_host}/videos/${video_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const updateManyVideo = async (video_ids, fields) => {
  const resp = await fetch(`${api_host}/videos/update-many`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ids: video_ids,
      fields
    })
  })
  return await resp.json()
}

export const uploadNewVideo = async (file, session_id, group) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('session', session_id)
  formData.append('group', group)
  const resp = await fetch(`${api_host}/videos/upload-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const createZipAndSendMail = async (video_ids, date, email) => {
  const resp = await fetch(`${api_host}/videos/get-zip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      filename: date,
      email,
      keys: video_ids
    })
  })
  return await resp.text()
}

export const getLastVideosTime = async (ids) => {
  const resp = await fetch(`${api_host}/videos/last-videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids })
  })
  return await resp.json()
}

export const getManyByTalent = async (record_id) => {
  const resp = await fetch(`${api_host}/videos/many-by-record/${record_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}
