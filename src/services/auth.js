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
