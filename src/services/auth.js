import { api_host, token } from './index'

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