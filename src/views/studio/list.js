import React, { useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import {
  assignCastingDirector,
  assignManagers,
  getManagers,
  searchUsers,
  getManyStudios,
  generateNewJitsiKey,
  deleteStudio,
  createOrUpdateStudio,
  getStudioSessions,
  createSession,
  updateSession,
  deleteSession,
  getUser
} from '../../services'
import StudioForm from './form'
import './style.scss'
import { USER_TYPES } from '../../constants'
import 'react-bootstrap-typeahead/css/Typeahead.css';

const generateArray = (s, e) => {
  let result = []
  for(let i = s; i < e; i ++) {
    result.push(i)
  }
  return result
}

let fnTimeoutHandler = null

const StudioList = () => {
  const [user, setUser] = useState({})
  const [studios, setStudios] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [sessions, setSessions] = useState({})
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [errors, setErrors] = useState({})
  const [studioId, setStudioId] = useState(null)
  const [sessionUsers, setSessionUsers] = useState([])
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false)
  const [selectedSessionManagers, setSelectedSessionManagers] = useState([])

  const searchSessionUsers = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const sessionUsers = await searchUsers(email, USER_TYPES.SESSION_MANAGER)
      setSessionUsers(sessionUsers)
      setLoadingSessionUsers(false)
    }, 1000)
  }

  const fetchManyStudios = async () => {
    const {studios, count} = await getManyStudios(page, pageSize)
    setStudios(studios)
    setPageCount(Math.ceil(count / pageSize))
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
      await fetchManyStudios()
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
    const result = await createOrUpdateStudio(object)
    if (user.user_type === USER_TYPES.CASTING_DIRECTOR) {
      await assignCastingDirector(result._id, user.id)
    }
    await fetchManyStudios()
    setSelectedStudio(null)
  }

  const handleSessionSubmit = async (session = {}, studio_id) => {
    const name = session.name
    const names = sessions[studio_id].map(s => s.name)
    const originalStudio = sessions[studio_id].find(s => s._id === session._id)
    if (names.includes(name) && sessions[studio_id]
     && (!originalStudio || originalStudio && originalStudio.name !== session.name)
    ) {
      window.alert(`You already have the session ${name}`)
      return
    }
    if (session._id) {
      await updateSession(session._id, { name })
      await assignManagers(session._id, selectedSessionManagers.map(m => m._id))
    } else {
      const newSession = await createSession({
        name,
        studio: studio_id
      })
      await assignManagers(newSession._id, selectedSessionManagers.map(m => m._id))
    }
    await fetchStudioSession(studio_id)
    setSelectedSession(null)
  }

  const handleSessionDelete = async (session, studio_id) => {
    const result = window.confirm(`Want to delete ${session.name}?`)
    if (result) {
      await deleteSession(session._id)
      await fetchStudioSession(studio_id)
    }
  }

  useEffect(() => {
    document.title = `Heyjoe`;
    setUser(getUser())
  }, [])

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      fetchManyStudios()
    }
  }, [page, pageSize])

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

  useEffect(() => {
    const fetchSessionManagers = async () => {
      setLoadingSessionUsers(true)
      const managers = await getManagers(selectedSession._id)
      setSelectedSessionManagers(managers)
      setLoadingSessionUsers(false)
    }
    if (selectedSession && selectedSession._id) {
      fetchSessionManagers()
    }
  }, [selectedSession])

  const newProjectClick = async () => {
    const { jitsi_meeting_id } = await generateNewJitsiKey()
    setSelectedStudio({
      jitsi_meeting_id
    })
  }

  const pages = generateArray(page - 2, page + 3).filter(p => p >= 0 && p < (pageCount))

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <label className="h1">
          Projects
        </label>
        <div className="d-flex">
          <button
            className="btn btn-primary mr-2 d-flex align-items-center"
            onClick={newProjectClick}
          ><FaPlus className="mr-2"/>Create Project</button>
        </div>
      </div>
      <div className="list-group mb-4">
        {(studios || []).map(studio => (
          <div className="col px-5 py-2 project-item" key={studio._id}>
            <div className="d-flex align-items-lg-baseline">
              <h4 className="mr-3">{studio.name}</h4>
              <label className="mr-3 mb-0">{studio.jitsi_meeting_id}</label>
              <div className="action-wrap">
                <FaPen className="mr-2" onClick={() => setSelectedStudio(studio)}/>
                <FaTrash onClick={() => deleteStudioHandle(studio)}/>
              </div>
              <label
                className="ml-auto text-danger new-session-btn"
                onClick={() => {
                  setSelectedSession({})
                  setStudioId(studio._id)
                }} 
              >Add New Session</label>
            </div>
            <div className="d-flex flex-column">
              {(sessions[studio._id] || []).map(session => (
                <div key={session._id} className="row mt-1 ml-2 mr-2">
                  <div className="col-2">
                    {session.name}
                  </div>
                  <div className="col-auto">
                    <Link to={`/studio/${studio.uri}/${session._id}`} className="text-danger" target="_blank">
                      Checkin
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link to={`/onboard/${studio.uri}/${session._id}`} className="text-danger"  target="_blank">
                      Onboard
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link to={`/video/${studio.uri}/${session._id}`}  className="text-danger" target="_blank">
                      Video Review
                    </Link>
                  </div>
                  <div className="col-auto action-wrap">
                    <FaPen className="mr-2" onClick={() => {
                      setSelectedSession(session)
                      setStudioId(studio._id)
                    }}/>
                    <FaTrash onClick={() => handleSessionDelete(session, studio._id)}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex align-items-center justify-content-center">
        {/* <select value={pageSize} onChange={ev => setPageSize(parseInt(ev.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select> */}
        {/* <span className="mx-2">Per page</span> */}
        <ul className="mb-0 d-flex pagination">
          <li onClick={() => setPage(Math.max(page - 1, 0))}>
            {'<'}
          </li>
          <li className="mx-2">
            Page {page + 1} / {pages.length}
          </li>
          <li onClick={() => setPage(Math.min(page + 1, pageCount - 1))}>
            {'>'}
          </li>
        </ul>
      </div>
      <Modal
        show={!!selectedSession}
        onHide = {() => {
          setSelectedSession(null)
        }}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {selectedSession && selectedSession.name? 'Edit Session': 'Create Session'}
          </h5>
        </Modal.Header>
        {selectedSession && 
          <Modal.Body>
            <input
              type="text"
              className="form-control mb-3"
              value={selectedSession.name}
              onChange={ev => {
                setSelectedSession({
                  ...selectedSession,
                  name: ev.target.value
                })
              }}
            />
            <AsyncTypeahead
              id="session-user-select"
              multiple
              selected={selectedSessionManagers}
              onChange={value => {
                setSelectedSessionManagers(value)
              }}
              isLoading={loadingSessionUsers}
              labelKey="email"
              minLength={2}
              onSearch={searchSessionUsers}
              options={sessionUsers}
              placeholder="Search for a Session user..."
            />
          </Modal.Body>
        }
        <Modal.Footer>
          <button
            disabled={selectedSession && !selectedSession.name}
            className="btn btn-primary"
            onClick={() => {
              handleSessionSubmit(selectedSession, studioId)
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="xl"
        show={!!selectedStudio}
        onHide = {() => {
          setSelectedStudio(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {selectedStudio && selectedStudio._id? `Update ${selectedStudio.name}`: 'Create New Project'}
          </h4>
          {selectedStudio && selectedStudio.casting_directors && selectedStudio.casting_directors.length > 0 && (
            <label className="mb-0">
              <span className="mr-1">Director: </span>
              {selectedStudio.casting_directors.map(director => director.email).join(',')}
            </label>
          )}
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default StudioList
