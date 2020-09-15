import { api_host, token } from './index'
import jwtDecode from 'jwt-decode'

export const loginApi = (email, password) => {
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

export const verityToken = () => {
  return new Promise((resolve, reject) => {
    if (token) {
      fetch(`${api_host}/api/verify-token`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log(data.user)
          if (data.user.email) {
            window.localStorage.setItem('token', data.token)
            resolve(data.user.email)
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

export const getUser = () => {
  try {
    const token = window.localStorage.getItem('token')
    const user = token ? jwtDecode(token) : null
    return user
  } catch(e) {
    return null
  }
}

export const searchUsers = (email, type) => {
  return fetch(`${api_host}/auth/users?email=${email}&type=${type}`,{
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getUserById = (id) => {
  return fetch(`${api_host}/auth/user/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(resp => resp.json())
}

export const updateUserFields = (id, formData) => {
  return fetch(`${api_host}/auth/user/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }).then(resp => resp.json())
}
