import { api_host, token } from './index'

export const getSessionVideos = (session_id) => {
  return fetch(`${api_host}/videos/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getSessionVideoDates = (session_id) => {
  const token = window.localStorage.getItem('token')
  return fetch(`${api_host}/videos/dates/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const createZipAndSendMail = (video_ids, date, email) => {
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
