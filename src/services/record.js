import { api_host, token } from './index'

export const fetchCheckInList = async (session_id) => {
  const resp = await fetch(`${api_host}/records/${session_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getOneRecord = async (record_id) => {
  const resp = await fetch(`${api_host}/records/one/${record_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateRecordField = async (id, fields) => {
  const resp = await fetch(`${api_host}/records/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const onboardUser = async (fields) => {
  const resp = await fetch(`${api_host}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const resp = await fetch(`${api_host}/records/upload-image`, {
    method: 'POST',
    body: formData
  })
  return await resp.json()
}

export const removeCheckinRecord = async (id) => {
  const resp = await fetch(`${api_host}/records/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const setRecordsGroup = async (data) => {
  const resp = await fetch(`${api_host}/records/set-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data
    })
  })
  return await resp.text()
}

export const getSessionGroupRecords = async (session_id, group) => {
  const resp = await fetch(`${api_host}/records/${session_id}/${encodeURI(group)}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateManyRecords = async (ids, fields) => {
  const resp = await fetch(`${api_host}/records/update-many`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ids,
      fields
    })
  })
  return await resp.json()
}

export const getGroupRecords = async (group_id) => {
  const resp = await fetch(`${api_host}/records/group-records/${group_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const addRecordToCurentGroup = async (record_id) => {
  const resp = await fetch(`${api_host}/records/add-to-group/${record_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const removeRecordFromCurrentGroup = async (record_id) => {
  const resp = await fetch(`${api_host}/records/remove-from-group/${record_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getCurrentGroup = async (session_id) => {
  const resp = await fetch(`${api_host}/records/current-group/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const finishCurrentGroup = async (session_id) => {
  const resp = await fetch(`${api_host}/records/finish-group/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}


export const updateGroup = async (id, data, record_ids) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.thumbnail) formData.append('thumbnail', data.thumbnail)
  formData.append('record_ids', record_ids)
  const resp = await fetch(`${api_host}/records/group/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const updateGroupOrder = async (data) => {
  const resp = await fetch(`${api_host}/records/group/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return await resp.json()
}

export const setFeedback = async (id, feedback) => {
  const resp = await fetch(`${api_host}/records/feedback/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ feedback })
  })
  return await resp.json()
}

export const newComment = async (id, content) => {
  const resp = await fetch(`${api_host}/records/comment/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  })
  return await resp.json()
}

export const clearSessionRecords = async (session_id) => {
  const resp = await fetch(`${api_host}/records/clear-record/${session_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}
