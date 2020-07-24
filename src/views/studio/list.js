import React, { useEffect, useState } from 'react'
import jwtDecode from 'jwt-decode'
import { Link } from 'react-router-dom'
import {
  getAllStudios,
  deleteStudio,
  createOrUpdateStudio
} from './api'
import StudioForm from './form'
import './style.css'

const StudioList = () => {
  const [studios, setStudios] = useState([])
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [errors, setErrors] = useState({})
  const [sessionUser, setSessionUser] = useState(false)

  const fetchAll = async () => {
    const studios = await getAllStudios()
    setStudios(studios)
  }

  const deleteStudioHandle = async (studio) => {
    const result = window.confirm("Want to delete?")
    if (result) {
      await deleteStudio(studio._id)
      await fetchAll()
    }
  }

  const handleStudioSubmit = async (event) => {
    event.preventDefault()
    setErrors({})

    const studio_uris = studios.map(s => s.uri)
    const meeting_ids = studios.map(s => s.jitsi_meeting_ids).flat()

    const form_data = new FormData(event.target)
    let error = {}
    let object = {}
    form_data.forEach(function(value, key){
      if (!value) return
      const parsed = /(.*)\[(\d+)\]/.exec(key)
      if (parsed) {
        const k = parsed[1]
        const idx = parseInt(parsed[2])
        if (object[k]) {
          object[k][idx] = value
        } else {
          object[k] = []
          object[k][idx] = value
        }

        if (
          k === 'jitsi_meeting_ids' &&
          meeting_ids.includes(value) &&
          !(selectedStudio.jitsi_meeting_ids || []).includes(value)
        ) {
          error['meeting_id'] = (error['meeting_id'] || []).concat(value)
        }

      } else {
        if (key === 'uri' && studio_uris.includes(value) && selectedStudio.uri !== value) {
          error['uri'] = value
        }
        object[key] = value
      }
    })

    setErrors(error)
    if (Object.keys(error).length > 0) { return }
    await createOrUpdateStudio(object)
    await fetchAll()
    setSelectedStudio(null)
  }

  useEffect(() => {
    const token = window.localStorage.getItem('token')
    const decoded = jwtDecode(token)
    if (decoded.session_user) {
      setSessionUser(true)
    } else {
      fetchAll()
    }
  }, [])

  if (sessionUser) {
    return <div>
      Oops! You don't have access to this page. Please contact your admin to get the correct link.
    </div>
  }

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex justify-content-between mb-5">
        <h3>Heyjoe</h3>
        <button
          className="btn btn-primary"
          onClick={() => setSelectedStudio({})}
        >Create Studio</button>
      </div>
      <label>All Studios</label>
      <ul className="list-group">
        {studios.map(studio => (
          <li className="list-group-item d-flex" key={studio._id}>
            <h4>{studio.name}</h4>
            <div className="d-flex flex-column">
              {studio.jitsi_meeting_ids && studio.jitsi_meeting_ids.map(meeting_id => (
                <div key={meeting_id} className="d-flex mt-1 ml-2">
                  <Link to={`/studio/${studio.uri}/${meeting_id}`} className="mr-3" >
                    Checkin manage {meeting_id}
                  </Link>
                  <Link to={`/onboard/${studio.uri}/${meeting_id}`} className="mr-3" >
                    Onboard {meeting_id} 
                  </Link>
                  <Link to={`/video/${studio.uri}/${meeting_id}`} >
                    Video review {meeting_id}
                  </Link>
                </div>
              ))}
            </div>
            <div className="ml-auto">
              <label className="mr-2" onClick={() => setSelectedStudio(studio)}>✎</label>
              <label onClick={() => deleteStudioHandle(studio)}>🗑</label>
            </div>
          </li>
        ))}
      </ul>

      {selectedStudio &&
        <StudioForm
          {...selectedStudio}
          onSubmit={handleStudioSubmit}
          errors={errors}
          onCancel={() => {
            setSelectedStudio(null)
            setErrors({})
          }}
        />}
    </div>
  )
}

export default StudioList
