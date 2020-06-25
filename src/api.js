const api_host = process.env.REACT_APP_API_HOST
const static_root = process.env.REACT_APP_API_HOST + '/static/'

const sendMessage = (message, studio_id, studio) => {
  const token = window.localStorage.getItem('token')

  return fetch(api_host+`/studio/message/${studio_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...message,
      body: message.body.replace('STUDIO_NAME', studio)
    })
  }).then(res => res.json())
}

const fetchCheckInList = (studio_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/${studio_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const updateRecordField = (id, fields) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

const onboardUser = (fields) => {
  return fetch(`${api_host}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

const removeCheckinRecord = (id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const loginApi = (email, password) => {
  return new Promise((resolve, reject) => {
    fetch(`${api_host}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email, password
      })
    })
    .then(resp => resp.json())
    .then(res => {
      if (res.success) {
        window.localStorage.setItem('token', res.token)
        resolve(res.token)
      } else {
        reject(res.error)
      }
    })
    .catch(err => reject(err))
  })
}

const verityToken = () => {
  return new Promise((resolve, reject) => {
    const token = window.localStorage.getItem('token')
    if (token) {
      fetch(`${api_host}/api/verify-token`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(user => {
          console.log(user)
          if (user.email) {
            resolve(user.email)
          } else {
            reject()
          }
        })
        .catch(err => reject(err))
    } else {
      reject()
    }
  })
}

const getStudioInfo = (studio_id) => {
  return fetch(`${api_host}/studio/${studio_id}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  }).then((resp) => resp.json())
}

const getStudioByUri = (studio_name) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/uri/${studio_name}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const getAllStudios = () => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const createCometRoom = (id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/comet-chat/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.text())
}

export {
  getStudioInfo,
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,
  onboardUser,
  loginApi,
  verityToken,
  getStudioByUri,
  getAllStudios,
  createCometRoom,
  static_root
}
