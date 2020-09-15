import { api_host, token } from './index'

export const fetchCheckInList = (session_id) => {
  return fetch(`${api_host}/records/${session_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getOneRecord = (record_id) => {
  return fetch(`${api_host}/records/one/${record_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const updateRecordField = (id, fields) => {
  return fetch(`${api_host}/records/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

export const onboardUser = (fields) => {
  return fetch(`${api_host}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields)
  }).then((resp) => resp.json())
}

export const removeCheckinRecord = (id) => {
  return fetch(`${api_host}/records/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const setRecordsGroup = (data) => {
  return fetch(`${api_host}/records/set-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data
    })
  }).then((resp) => resp.text())
}

export const getSessionGroupRecords = (session_id, group) => {
  return fetch(`${api_host}/records/${session_id}/${encodeURI(group)}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const updateManyRecords = (ids, fields) => {
  return fetch(`${api_host}/records/update-many`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ids,
      fields
    })
  }).then((resp) => resp.json())
}


export const getGroupRecords = (group_id) => {
  return fetch(`${api_host}/records/group-records/${group_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(resp => resp.json())
}

export const addRecordToCurentGroup = (record_id) => {
  return fetch(`${api_host}/records/add-to-group/${record_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const removeRecordFromCurrentGroup = (record_id) => {
  return fetch(`${api_host}/records/remove-from-group/${record_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const getCurrentGroup = (session_id) => {
  return fetch(`${api_host}/records/current-group/${session_id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

export const finishCurrentGroup = (session_id) => {
  return fetch(`${api_host}/records/finish-group/${session_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then((resp) => resp.json())
}

