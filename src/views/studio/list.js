import React, { useEffect, useState } from 'react'
import jwtDecode from 'jwt-decode'
import { Link } from 'react-router-dom'
import {
  getAllStudios,
  deleteStudio,
  createOrUpdateStudio,
  getStudioSessions,
  createSession,
  updateSession,
  deleteSession
} from '../../services'
import StudioForm from './form'
import './style.css'

const StudioList = () => {
  const [studios, setStudios] = useState([])
  const [sessions, setSessions] = useState({})
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [errors, setErrors] = useState({})
  const [userType, setUserType] = useState('')

  const fetchAllStudios = async () => {
    const studios = await getAllStudios()
    setStudios(studios)
  }

  const fetchStudioSession = async (studio_id) => {
    const ss = await getStudioSessions(studio_id)
    setSessions({
      ...sessions,
      [studio_id]: ss
    })
  }

  const deleteStudioHandle = async (studio) => {
    const result = window.confirm(`Want to delete ${studio.name}?`)
    if (result) {
      setSelectedStudio(null)
      await deleteStudio(studio._id)
      await fetchAllStudios()
    }
  }

  const handleStudioSubmit = async (event) => {
    event.preventDefault()
    setErrors({})

    const studio_uris = studios.map(s => s.uri)
    const meeting_ids = studios.map(s => s.jitsi_meeting_id)

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
          k === 'jitsi_meeting_id' &&
          meeting_ids.includes(value) &&
          !(selectedStudio.jitsi_meeting_id !== value)
        ) {
          error['meeting_id'] = value
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
    await fetchAllStudios()
    setSelectedStudio(null)
  }

  const handleSessionSubmit = async (session = {}, studio_id) => {
    const name = window.prompt('Session name, please', session.name || 'session')
    if (!name) return
    const names = sessions[studio_id].map(s => s.name)
    if (names.includes(name)) {
      window.alert(`You already have the session ${name}`)
      return
    }
    if (session._id) {
      await updateSession(session._id, { name })
    } else {
      await createSession({
        name,
        studio: studio_id
      })
    }
    await fetchStudioSession(studio_id)
  }

  const handleSessionDelete = async (session, studio_id) => {
    const result = window.confirm(`Want to delete ${session.name}?`)
    if (result) {
      await deleteSession(session._id)
      await fetchStudioSession(studio_id)
    }
  }

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      const token = window.localStorage.getItem('token')
      const decoded = jwtDecode(token)
      setUserType(decoded.user_type)
      fetchAllStudios()
      document.title = `Heyjoe`;
    }
  }, [])

  useEffect(() => {
    const fetchAllSessions = async () => {
      if (!studios || studios.length === 0) { return }
      let ss = {}
      for(let i = 0; i < studios.length; i ++) {
        const studioSesssions = await getStudioSessions(studios[i]._id)
        ss[studios[i]._id] = studioSesssions
      }
      setSessions(ss)
    }
    fetchAllSessions()
  }, [studios])

  if (['client', 'session_director'].includes(userType)) {
    return <div className="p-2 d-flex justify-content-between">
      <p>
        Oops! You don't have access to this page. Please contact your admin to get the correct link.
      </p>
    </div>
  }

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex justify-content-between mb-5">
        <h3>Heyjoe</h3>
        <div className="d-flex">
          <button
            className="btn btn-primary mr-2"
            onClick={() => setSelectedStudio({})}
          >Create Project</button>
        </div>
      </div>
      <label>All Projects</label>
      <ul className="list-group">
        {studios.map(studio => (
          <li className="list-group-item row d-flex" key={studio._id}>
            <div className="col">
              <div className="d-flex align-items-lg-baseline">
                <h4 className="mr-3">{studio.name}</h4>
                <small onClick={() => handleSessionSubmit({}, studio._id)} >Add New Session</small>
              </div>
              <div className="d-flex flex-column">
                {(sessions[studio._id] || []).map(session => (
                  <div key={session._id} className="d-flex mt-1 ml-2 mr-2">
                    <div>
                      <Link to={`/studio/${studio.uri}/${session._id}`} className="mr-3" >
                        Checkin manage {session.name}
                      </Link>
                      <Link to={`/onboard/${studio.uri}/${session._id}`} className="mr-3" >
                        Onboard {session.name} 
                      </Link>
                      <Link to={`/video/${studio.uri}/${session._id}`} >
                        Video review {session.name}
                      </Link>
                    </div>
                    <div className="ml-auto">
                      <small className="mr-2" onClick={() => handleSessionSubmit(session, studio._id)}>✎</small>
                      <small onClick={() => handleSessionDelete(session, studio._id)}>🗑</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-auto">
              <label className="mr-2" onClick={() => setSelectedStudio(studio)}>✎</label>
              <label onClick={() => deleteStudioHandle(studio)}>🗑</label>
            </div>
          </li>
        ))}
      </ul>

      {selectedStudio &&
        <StudioForm
          key={selectedStudio._id}
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
