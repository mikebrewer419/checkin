import { api_host, token } from './index'

export const addRecordToCurentTWRGroup = async (record_id, session_id) => {
  return await fetch(api_host+`/twr/add-to-group/${record_id}/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json())
}

export const removeRecordFromCurrentTWRGroup = async (record_id, session_id) => {
  return await fetch(api_host+`/twr/remove-from-group/${record_id}/${session_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json())
}

export const getcurrentTWRGroup = async (session_id) => {
  return await fetch(api_host+`/twr/current-group/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json())
}

export const finishCurrentTWRGroup = async (session_id) => {
  return await fetch(api_host+`/twr/finish-group/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
}
