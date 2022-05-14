import { api_host, token } from '../index'
import { obj2Query } from '../../utils'

export const listRequests = async (filter) => {
  const resp = await fetch(`${api_host}/freelancer/request/${obj2Query(filter)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return await resp.json()
}
