export const api_host = process.env.REACT_APP_API_HOST
export const static_root = process.env.REACT_APP_API_HOST + '/static/'
export const token = window.localStorage.getItem('token')

export * from './auth'
export * from './record'
export * from './session'
export * from './studio'
export * from './video'
