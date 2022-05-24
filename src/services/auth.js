import { api_host, token } from './consts'
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

export const googleLogin = (email, token) => {
  return new Promise((resolve, reject) => {
    fetch(`${api_host}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email, token
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

export const googleRegister = async (fields) => {
  const resp = await fetch(`${api_host}/auth/google-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields)
  })
  return await resp.json()
}

export const verityToken = () => {
  return new Promise((resolve, reject) => {
    if (token) {
      fetch(`${api_host}/verify-token`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
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

export const register = async (formData) => {
  const resp = await fetch(`${api_host}/auth/register`, {
    method: 'POST',
    body: formData
  })
  return await resp.json()
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

export const searchUsers = async (email, type) => {
  let url = null
  if(!!type){
    url = `${api_host}/auth/users?email=${email}&type=${type}`
  } else {
    url = `${api_host}/auth/users?email=${email}`
  }
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const getUserById = async (id) => {
  const resp = await fetch(`${api_host}/auth/user/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const updateUserFields = async (id, formData) => {
  const resp = await fetch(`${api_host}/auth/user/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  return await resp.json()
}

export const verifyCaptcha = async (token) => {
  const resp = await fetch(`${api_host}/auth/captcha-verify/${token}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}

export const resetPasswordRequest = async (email) => {
  const resp = await fetch(`${api_host}/auth/reset-password-request?email=${email}`, {
    method: 'POST'
  })
  return await resp.json()
}

export const resetPassword = async (token, newPassword) => {
  const resp = await fetch(`${api_host}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      password: newPassword
    })
  })
  return await resp.json()
}

export const getVersion = async () => {
  const resp = await fetch(`${api_host}/auth/version`)
  return await resp.json()
}
