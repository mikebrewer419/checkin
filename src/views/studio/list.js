import React, { useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import { FaPlus, FaPen, FaTrash, FaLink, FaCopy, FaRegCopy } from 'react-icons/fa';
import {
  static_root,
  assignCastingDirector,
  assignManagers,
  getManagers,
  searchUsers,
  getManyStudios,
  generateNewJitsiKey,
  generateNewProjectUri,
  deleteStudio,
  createOrUpdateStudio,
  getStudioSessions,
  getSessionsByStudios,
  getPagesByStudio,
  getPagesByStudios,
  updatePage,
  createPage,
  deletePage,
  createSession,
  updateSession,
  deleteSession,
  getUser
} from '../../services'
import StudioForm from './form'
import './style.scss'
import Footer from '../../components/Footer'
import { USER_TYPES, STUDIO_LIST_PERMISSIONS } from '../../constants'
import 'react-bootstrap-typeahead/css/Typeahead.css';

const host = window.location.origin

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
  const [searchKey, setSearchKey] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [sessions, setSessions] = useState({})
  const [postingPages, setPostingPages] = useState({})
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [errors, setErrors] = useState({})
  const [studioId, setStudioId] = useState(null)
  const [sessionUsers, setSessionUsers] = useState([])
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false)
  const [selectedSessionManagers, setSelectedSessionManagers] = useState([])
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmCallback, setConfirmCallback] = useState(null)

  const [castingDirectors, setCastingDirectors] = useState([])
  const [studioCastingDirector, setStudioCastingDirector] = useState(0)
  const [selectedCastingDirector, setSelectedCastingDirector] = useState(null)
  const [selectedPostingPage, setSelectedPostingPage] = useState(null)

  const [emailCheckinLink, setEmailCheckinLink] = useState('')
  const [emailProjectName, setEmailProjectName] = useState('')
  const [emailSessionLink, setEmailSessionLink] = useState('')

  const searchSessionUsers = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const sessionUsers = await searchUsers(email, USER_TYPES.SESSION_MANAGER)
      setSessionUsers(sessionUsers)
      setLoadingSessionUsers(false)
    }, 1000)
  }

  const searchCastingDirectors = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const users = await searchUsers(email, USER_TYPES.CASTING_DIRECTOR)
      setCastingDirectors(users)
      setLoadingSessionUsers(false)
    }, 1000)
  }

  const fetchManyStudios = async () => {
    const {studios, count} = await getManyStudios(page, pageSize, searchKey)
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

  const fetchStudioPostingPage = async (studio_id) => {
    const pp = await getPagesByStudio(studio_id)
    setPostingPages({
      ...postingPages,
      [studio_id]: pp
    })
  }

  const deleteStudioHandle = async (studio) => {
    const callback = async () => {
      setSelectedStudio(null)
      await deleteStudio(studio._id)
      await fetchManyStudios()
    }
    setConfirmMessage(`Want to delete ${studio.name}?`)
    setConfirmCallback(() => callback)
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
    const formData = new FormData()
    formData.append('name', name)
    if (selectedSession.size_card_pdf) {
      formData.append('size_card_pdf', selectedSession.size_card_pdf)
    }
    if (selectedSession.schedule_pdf) {
      formData.append('schedule_pdf', selectedSession.schedule_pdf)
    }
    if (session._id) {
      await updateSession(session._id, formData)
      await assignManagers(session._id, selectedSessionManagers.map(m => m._id))
    } else {
      formData.append('studio', studio_id)
      const newSession = await createSession(formData)
      await assignManagers(newSession._id, selectedSessionManagers.map(m => m._id))
    }
    await fetchStudioSession(studio_id)
    setSelectedSession(null)
  }

  const handlePostingPageSubmit = async (postingPage={}, studio_id) => {
    const name = postingPage.name
    const names = postingPages[studio_id].map(p => p.name)
    const originalPP = postingPages[studio_id].find(p => p._id === postingPage._id)
    if (names.includes(name) && postingPages[studio_id]
     && (!originalPP || originalPP && originalPP.name !== postingPage.name)
    ) {
      window.alert(`You already have the posting page ${name}`)
      return
    }
    if (postingPage._id) {
      await updatePage(postingPage._id, postingPage)
    } else {
      const newPage = await createPage({
        name,
        studio: studio_id
      })
    }
    await fetchStudioPostingPage(studio_id)
    setSelectedPostingPage(null)
  }

  const handlePPDelete = async (postingPage, studio_id) => {
    const callback = async () => {
      await deletePage(postingPage._id)
      await fetchStudioPostingPage(studio_id)
    }
    setConfirmMessage(`Want to delete ${postingPage.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleSessionDelete = async (session, studio_id) => {
    const callback = async () => {
      await deleteSession(session._id)
      await fetchStudioSession(studio_id)
    }
    setConfirmMessage(`Want to delete ${session.name}?`)
    setConfirmCallback(() => callback)
  }

  useEffect(() => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(() => {
      fetchManyStudios()
    }, 1000)
  }, [searchKey])

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
    const fetchAllSessionsAndPPs = async () => {
      if (!studios || studios.length === 0) { return }
      const studioIds = studios.map(s => s._id)
      const allSessions = await getSessionsByStudios(studioIds)
      let ss = {}, pp = {}
      const allPostingPages = await getPagesByStudios(studioIds)
      for(let i = 0; i < studios.length; i ++) {
        ss[studios[i]._id] = allSessions.filter(s => s.studio === studios[i]._id)
        pp[studios[i]._id] = allPostingPages.filter(p => p.studio === studios[i]._id)
      }
      setSessions(ss)
      setPostingPages(pp)
    }
    fetchAllSessionsAndPPs()
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
    const { jitsi_meeting_id: test_meeting_id } = await generateNewJitsiKey()
    const { project_uri } = await generateNewProjectUri()
    setSelectedStudio({
      jitsi_meeting_id,
      test_meeting_id,
      uri: project_uri
    })
  }

  const confirmCancel = () => {
    setConfirmCallback(null)
    setConfirmMessage('')
  }

  const confirmYes = () => {
    confirmCallback()
    confirmCancel()
  }

  const handleCopyText = (selector) => {
    const str = document.querySelector(selector).innerHTML
    function listener(e) {
      e.clipboardData.setData("text/html", str);
      e.clipboardData.setData("text/plain", str);
      e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
  }

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <label className="h1">
          Projects
        </label>
        <div className="mr-auto ml-5">
          <input className="form-control" placeholder="Project name"
            value={searchKey} onChange={ev => setSearchKey(ev.target.value)}
          />
        </div>
        <div className="d-flex">
          {STUDIO_LIST_PERMISSIONS.CAN_CREATE_STUDIO() && (
            <button
              className="btn btn-primary mr-2 d-flex align-items-center"
              onClick={newProjectClick}
            ><FaPlus className="mr-2"/>Create Project</button>
          )}
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
                <label
                  className="ml-4 mb-0"
                  onClick={() => {
                    setStudioCastingDirector(studio._id)
                    setSelectedCastingDirector(studio.casting_directors)
                  }} 
                >
                  <FaLink title="Assign Director"/>
                  <span className="ml-1">{studio.casting_directors.map(c => c.email).join(',')}</span>
                </label>
              </div>
              <label
                className="ml-auto text-danger new-session-btn"
                onClick={() => {
                  setSelectedPostingPage({})
                  setStudioId(studio._id)
                }} 
              >Add New Posting Page</label>
              <label
                className="ml-3 text-danger new-session-btn"
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
                      Session Video Chat
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link to={`/studio/${studio.uri}/${session._id}?test=true`} className="text-danger" target="_blank">
                      Virtual Lobby
                    </Link>
                  </div>
                  {STUDIO_LIST_PERMISSIONS.CAN_VIEW_ONBOARD() &&
                  <div className="col-auto">
                    <Link to={`/onboard/${studio.uri}/${session._id}`} className="text-danger"  target="_blank">
                      Session Check-In
                    </Link>
                  </div>}
                  {STUDIO_LIST_PERMISSIONS.CAN_VIEW_VIDEO_REVIEW() &&
                  <div className="col-auto">
                    <Link to={`/video/${studio.uri}/${session._id}`}  className="text-danger" target="_blank">
                      Video Review
                    </Link>
                  </div>}
                  <div className="col-auto action-wrap">
                    <FaPen className="mr-2" onClick={() => {
                      setSelectedSession(session)
                      setStudioId(studio._id)
                    }}/>
                    <FaTrash className="mr-4" onClick={() => handleSessionDelete(session, studio._id)}/>
                    <FaCopy
                      className="mr-2" title="Copy Talent Email"
                      onClick={() => {
                        setEmailCheckinLink(`${host}/onboard/${studio.uri}/${session._id}`)
                      }}
                    />
                    <FaRegCopy
                      className="mr-2" title="Copy Client Email"
                      onClick={() => {
                        setEmailProjectName(studio.name)
                        setEmailSessionLink(`${host}/studio/${studio.uri}/${session._id}`)
                      }}
                    />
                  </div>
                </div>
              ))}
              {(postingPages[studio._id] || []).length > 0 && <hr className="w-100 mt-2 mb-0" />}
              {(postingPages[studio._id] || []).map(pp => (
                <div key={pp._id} className="row mt-1 ml-2 mr-2">
                  <div className="col-2">
                    {pp.name}
                  </div>
                  <div className="col-auto">
                    <Link to={`/posting-page/${studio.uri}/${pp._id}`} className="text-danger" target="_blank">
                      View Posting Page
                    </Link>
                  </div>
                  <div className="col-auto action-wrap">
                    <FaPen className="mr-2" onClick={() => {
                      setSelectedPostingPage(pp)
                      setStudioId(studio._id)
                    }}/>
                    <FaTrash onClick={() => handlePPDelete(pp, studio._id)}/>
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
            Page {page + 1} / {pageCount}
          </li>
          <li onClick={() => setPage(Math.min(page + 1, pageCount - 1))}>
            {'>'}
          </li>
        </ul>
      </div>
      <Modal
        show={!!confirmMessage}
        onHide = {confirmCancel}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {confirmMessage}
          </h5>
        </Modal.Header>
        <Modal.Footer>
          <button
            className="btn btn-danger"
            onClick={confirmYes}
          >Yes.</button>
          <button
            className="btn btn-link"
            onClick={confirmCancel}
          >Cancel</button>
        </Modal.Footer>
      </Modal>
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
            <label>Session Name</label>
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
            <label>Session Manager</label>
            <AsyncTypeahead
              id="session-user-select"
              className="mb-3"
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
            <label>
              Sizecard PDF
              {typeof selectedSession.size_card_pdf === 'string' && (
                <a href={`${static_root}${selectedSession.size_card_pdf}`} target="_blank" className="ml-2">
                  View
                </a>
              )}
            </label>
            <input
              type="file"
              className="form-control mb-3"
              onChange={ev => {
                setSelectedSession({
                  ...selectedSession,
                  size_card_pdf: ev.target.files[0]
                })
              }}
            />
            <label>
              Schedule PDF
              {typeof selectedSession.schedule_pdf === 'string' && (
                <a href={`${static_root}${selectedSession.schedule_pdf}`} target="_blank" className="ml-2">
                  View
                </a>
              )}
            </label>
            <input
              type="file"
              className="form-control mb-3"
              onChange={ev => {
                setSelectedSession({
                  ...selectedSession,
                  schedule_pdf: ev.target.files[0]
                })
              }}
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
        show={!!studioCastingDirector}
        onHide = {() => {
          setStudioCastingDirector(0)
          setSelectedCastingDirector([])
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Assign Casting Director
          </h4>
        </Modal.Header>
        <Modal.Body>
          <AsyncTypeahead
            id="casting-director-select"
            selected={selectedCastingDirector}
            onChange={value => {
              setSelectedCastingDirector(value)
            }}
            isLoading={loadingSessionUsers}
            labelKey="email"
            minLength={2}
            onSearch={searchCastingDirectors}
            options={castingDirectors}
            placeholder="Search for a Session user..."
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={!selectedCastingDirector}
            className="btn btn-primary"
            onClick={async () => {
              await assignCastingDirector(studioCastingDirector, selectedCastingDirector.map(c => c._id))
              await fetchManyStudios()
              setStudioCastingDirector(0)
              setSelectedCastingDirector([])
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
            {!selectedStudio || !selectedStudio._id && <p className="h6 font-weight-normal mt-1">
              Please make sure all credentials are preperly configured for your account.
            </p>}
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
      <Modal
        show={!!selectedPostingPage}
        onHide={() => {
          setSelectedPostingPage(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {selectedPostingPage && selectedPostingPage._id? `Update ${selectedPostingPage.name}`: 'Create New Posting Page'}
          </h4>
        </Modal.Header>
        <Modal.Body>
          {selectedPostingPage && (
            <input
              type="text"
              className="form-control mb-3"
              value={selectedPostingPage.name}
              onChange={ev => {
                setSelectedPostingPage({
                  ...selectedPostingPage,
                  name: ev.target.value
                })
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={selectedPostingPage && !selectedPostingPage.name}
            className="btn btn-primary"
            onClick={() => {
              handlePostingPageSubmit(selectedPostingPage, studioId)
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="xl"
        show={!!emailCheckinLink}
        onHide={() => {
          setEmailCheckinLink(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Copy Talent Email
          </h4>
        </Modal.Header>
        <Modal.Body className="bg-lightgray">
          <div id="talent-email-text">
            <p>You can audition from your phone or computer. Please choose the device that you believe has the best camera and internet connection (a newer smartphone usually works best). Here are the instructions: </p>
            <p>
              <strong>AUDITION FROM PHONE:</strong>
            </p>
            <ol>
              <li>
                <p>Download the Hey Joe app</p>
              </li>
            </ol>
            <p>
              iOS: <a rel="nofollow noreferrer noopener" target="_blank" href="https://apple.co/3grIxwR">https://apple.co/3grIxwR</a><br />
              Android: <a rel="nofollow noreferrer noopener" target="_blank" href="https://bit.ly/2MLDLwL">https://bit.ly/2MLDLwL</a><br />
            </p>
            <ol>
              <li>
                <p>Check in from a web browser</p>
              </li>
            </ol>
            <p>15 minutes before your call time, click the link below to check in to the session:
              <br />
                <a rel="nofollow noreferrer noopener" target="_blank" href={emailCheckinLink}>{emailCheckinLink}</a>
              </p>
              <ol>
                <li>
                  <p>After you check in, click the virtual lobby link or open up “Hey Joe" and enter the room number you receive on the check in page</p>
                </li>
              </ol>
              <ul>
                <li>
                  <p>When it's time for your audition you will be sent a new link and code to enter the audition room. You will hang up from the virtual lobby and either click the new link or enter the new 4 digit code.</p>
                </li>
              </ul>
              <p>
                <strong>AUDITION FROM COMPUTER:</strong>
              </p>
              <ol>
                <li>
                  <p>Set up your computer and open a browser (preferably Google Chrome)</p>
                </li>
                <li>
                  <p>15 minutes before your call time, click the link below to check in to the session:</p>
                </li>
              </ol>
              <p>
                <a rel="nofollow noreferrer noopener" target="_blank" href={emailCheckinLink}>{emailCheckinLink}</a>
              </p>
              <ol>
                <li>
                  <p>After you check in, click the link to join the virtual lobby</p>
                </li>
              </ol>
              <ul>
                <li>
                  <p>When it's time for your audition you will be sent a new link and code to enter the audition room. You will hang up from the virtual lobby and either click the new link or enter the new 4 digit code.</p>
                </li>
              </ul>
              <p>Audition Guidelines:</p>
              <ul>
                <li>
                  <p>Put your device in Landscape (horizontal) position.</p>
                </li>
                <li>
                  <p>Turn off “Portrait Orientation” lock if it’s turned on.</p>
                </li>
                <li>
                  <p>Device eye level, not below you on a table or way above you</p>
                </li>
                <li>
                  <p>Light yourself from the front. Do not stand in front of a window.</p>
                </li>
                <li>
                  <p>Post your sides level with your camera so you are not looking off to the side or down below camera.</p>
                </li>
                <li>
                  <p>Make sure you have a good connection before logging in. Set up as close to your WiFi router as possible. In the same room as WiFi is best.</p>
                </li>
                <li>
                  <p>If any of the above guidelines are not followed, we will ask you to leave the audition room to set up properly, and we will call you back in later.</p>
                </li>
              </ul>
              <p>
                ***you can watch a set up best practices video here - 
                <a href="https://heyjoe.io/actor-set-up/" title="https://heyjoe.io/actor-set-up/" data-renderer-mark="true">https://heyjoe.io/actor-set-up/</a>
                <br />
                ***you can find troubleshooting tips here - 
                <a href="https://heyjoe.io/troubleshooting/" title="https://heyjoe.io/troubleshooting/" data-renderer-mark="true">https://heyjoe.io/troubleshooting/</a>
              </p>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={selectedPostingPage && !selectedPostingPage.name}
            className="btn btn-primary"
            onClick={() => {
              handleCopyText('#talent-email-text')
              setEmailCheckinLink(null)
            }}
          >
            Copy
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!emailProjectName}
        onHide={() => {
          setEmailProjectName(null)
          setEmailSessionLink(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Copy Client Email
          </h4>
        </Modal.Header>
        <Modal.Body className="bg-lightgray">
          <div id="client-email-text">
            <p>
              Here is the <b>{emailProjectName}</b> Session Link:<br/>
              <a href={emailSessionLink}>{emailSessionLink}</a>
            </p>
            <p>
              <b>
                <i>
                  Note: For best results, please access the Hey Joe web app from your laptop or desktop computer in Google Chrome or a Chromium clone like Brave. You can either create an account on the website or choose "Login with Google." Please reach out to tech support at 424.888.4735 if you have any issues connecting. I attached a PDF with helpful tips as well.
                </i>
              </b>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={selectedPostingPage && !selectedPostingPage.name}
            className="btn btn-primary"
            onClick={() => {
              handleCopyText('#client-email-text')
              setEmailProjectName(null)
              setEmailSessionLink(null)
            }}
          >
            Copy
          </button>
        </Modal.Footer>
      </Modal>

      <Footer/>
    </div>
  )
}

export default StudioList
