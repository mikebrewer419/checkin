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

const fetchCheckInList = (studio_id, meeting_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/${studio_id}/${meeting_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const getOneRecord = (record_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/one/${record_id}`, {
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

const createCometRoom = (id, meeting_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/studio/comet-chat/${id}/${meeting_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.text())
}

const getStudioVideosByDate = (studio_id, meeting_id, date) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/videos/${studio_id}/${meeting_id}/${date}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const getStudioVideoDates = (studio_id, meeting_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/videos/dates/${studio_id}/${meeting_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

const createZipAndSendMail = (video_ids, date, email) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/videos/get-zip`, {
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
  }).then((resp) => resp.text())
}

const setRecordsGroup = (data) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/set-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data
    })
  }).then((resp) => resp.text())
}

const getStudioGroupRecords = (studio, meeting_id, group) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/records/${studio}/${meeting_id}/${encodeURI(group)}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export {
  getStudioInfo,
  sendMessage,
  getOneRecord,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,
  onboardUser,
  loginApi,
  verityToken,
  getStudioByUri,
  createCometRoom,
  getStudioVideosByDate,
  getStudioVideoDates,
  createZipAndSendMail,
  setRecordsGroup,
  getStudioGroupRecords,
  static_root
}
