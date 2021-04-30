import { twr_api_host as api_host, twr_token as token } from './index'

export const twrFetchCheckInList = async (studio_id) => {
  return await fetch(`${api_host}/records/${studio_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const twrGetOneRecord = async (record_id) => {
  return await fetch(`${api_host}/records/one/${record_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const twrUpdateRecordField = async (id, fields) => {
  return await fetch(`${api_host}/records/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

export const twrGetStudioByTWRUri = async (twr, studio_name) => {
  console.log('api_host: ', api_host, token);
  return await fetch(`${api_host}/studio/uri/${twr}/${studio_name}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const twrSendMessage = async (message, studio_id, record_id = '') => {
  return await fetch(api_host+`/studio/message/${studio_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: message.to,
      body: message.body + ' *Do Not Reply*',
      record_id
    })
  }).then(res => res.json())
}

export const twrClearRecords = async (studio_id) => {
  return await fetch(api_host+`/studio/records/${studio_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => res.json())
}

export const twrGetTWRByDomain = async (domain) => {
  return await fetch(`${api_host}/twr/domain/${domain}`).then((resp) => resp.json())
}

