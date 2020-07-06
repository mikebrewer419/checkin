const api_host = process.env.REACT_APP_API_HOST
const static_root = process.env.REACT_APP_API_HOST + '/static/'

const getAllStudios = () => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const createOrUpdateStudio = (studio) => {
  const token = window.localStorage.getItem('token')
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

const deleteStudio = (studio_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/${studio_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export {
  getAllStudios,
  createOrUpdateStudio,
  deleteStudio
}
