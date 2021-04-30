export const api_host = process.env.REACT_APP_API_HOST
export const static_root = process.env.REACT_APP_API_HOST + '/s3/'
export const temp_root = process.env.REACT_APP_API_HOST + '/static/'
export const token = window.localStorage.getItem('token')
export const super_admins = (process.env.REACT_APP_SUPER_ADMINS || '').split(',')
export const twr_api_host = process.env.REACT_APP_TWR_API_HOST
export const twr_static_host = process.env.REACT_APP_TWR_API_HOST + '/static/'
export const twr_token = process.env.REACT_APP_TWR_API_KEY

export * from './auth'
export * from './record'
export * from './session'
export * from './studio'
export * from './video'
export * from './user'
export * from './postingpage'
export * from './twr'
