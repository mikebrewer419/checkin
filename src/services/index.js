import { api_host } from './consts'

export * from './consts'
export * from './auth'
export * from './record'
export * from './session'
export * from './studio'
export * from './video'
export * from './user'
export * from './postingpage'
export * from './twr'
export * from './heyjoe-twr'
export * from './admin'
export * from './sync'
export * from './freelancer'

export const getQrCode = async (data) => {
  const resp = await fetch(`${api_host}/qr-code?q=${encodeURIComponent(data)}`)
  return await resp.json()
}
