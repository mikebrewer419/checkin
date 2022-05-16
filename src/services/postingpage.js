import { api_host, token } from './consts'

export const getPagesByStudio = async (studio_id) => {
  const resp = await fetch(`${api_host}/postingpage/${studio_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getPagesByStudios = async (studio_ids) => {
  const resp = await fetch(`${api_host}/postingpage/by-studios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({studio_ids})
  })
  return await resp.json()
}

export const getOnePage = async (id) => {
  const resp = await fetch(`${api_host}/postingpage/one/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const createPage = async (fields) => {
  const resp = await fetch(`${api_host}/postingpage/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const updatePage = async (id, fields) => {
  const resp = await fetch(`${api_host}/postingpage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const deletePage = async (id) => {
  const resp = await fetch(`${api_host}/postingpage/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const copyGroupFromSession = async (session_group_id, postingpage_id, send_link) => {
  const resp = await fetch(`${api_host}/postingpage/copy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      group: session_group_id,
      postingpage: postingpage_id,
      send_email: send_link
    })
  })
  return await resp.json()
}

export const updatePostingVideo = async (id, fields) => {
  const resp = await fetch(`${api_host}/postingpage/video/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const updatePostingManyVideo = async (video_ids, fields) => {
  const resp = await fetch(`${api_host}/postingpage/video/update-many`, {
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

export const getPageVideos = async (page_id, is_archived = false) => {
  const resp = await fetch(`${api_host}/postingpage/videos/${page_id}?is_archived=${is_archived}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const uploadNewPostingVideo = async (file, postingpage, group) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('postingpage', postingpage)
  formData.append('group', group)
  const resp = await fetch(`${api_host}/postingpage/upload-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const updatePostingGroup = async (id, data) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.thumbnail) formData.append('thumbnail', data.thumbnail)
  const resp = await fetch(`${api_host}/postingpage/group/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const deletePageVideo = async (id) => {
  const resp = await fetch(`${api_host}/postingpage/video/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updatePostingGroupOrder = async (groups) => {
  const resp = await fetch(`${api_host}/postingpage/update-group-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ groups })
  })
  return await resp.json()
}

export const updatePostingVideoOrder = async (videos) => {
  const resp = await fetch(`${api_host}/postingpage/update-video-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ videos })
  })
  return await resp.json()
}
