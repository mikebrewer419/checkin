import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import {
  useSelector,
  useDispatch,
} from 'react-redux'

import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import clsx from 'classnames'
import { Link } from 'react-router-dom'
import { 
  Modal,
  Button,
} from 'react-bootstrap'

import {
  FaPen,
  FaLink,
  FaBackward,
  FaArchive,
  FaTrash,
} from 'react-icons/fa';
import moment from 'moment'
import {
  static_root,
  assignCastingDirector,
  searchUsers,
  deleteStudio,
  getPagesByStudio,
  createSession,
  updateSession,
  archiveStudio,
  unArchiveStudio,
} from '../../services'
import './style.scss'

import {
  SESSION_TIME_TYPE,
  USER_TYPE,
  USER_TYPES,
  STUDIO_LIST_PERMISSIONS,
} from '../../constants'

import 'react-bootstrap-typeahead/css/Typeahead.css';
import { humanFileSize } from '../../utils'

import SessionCrupdateModal from './SessionCrupdateModal'
import { ShowLoadingContext } from '../../Context'
import Session from './Session'
import PostingPage from './PostingPage'
import StudioCrupdateModal from './StudioCrupdateModal'
import PostingPageCrupdateModal from './PostingPageCrupdateModal'

const host = window.location.origin

let fnTimeoutHandler = null

const formatDate = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('M/D/YYYY')
  return ''
}

export default ({studio}) => {
  const toggleLoading = useContext(ShowLoadingContext)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCastingDirectorModal, setShowCastingDirectorModal] = useState(false)
  const [showCreatePostingPageModal, setShowCreatePostingPageModal] = useState(false)
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false)

  const [postingPages, setPostingPages] = useState({})
  const [selectedSession, setSelectedSession] = useState(null)
  const [studioId, setStudioId] = useState(null)
  const [loadingSessionUsers, toggleLoadingSessionUsers] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(null)
  const [confirmCallback, setConfirmCallback] = useState(null)

  const [castingDirectors, setCastingDirectors] = useState([])
  const [studioCastingDirector, setStudioCastingDirector] = useState(0)
  const [selectedCastingDirector, setSelectedCastingDirector] = useState(null)
  const [selectedPostingPage, setSelectedPostingPage] = useState(null)

  const searchCastingDirectors = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      toggleLoadingSessionUsers(true)
      const users = await searchUsers(email, USER_TYPES.CASTING_DIRECTOR)
      setCastingDirectors(users)
      toggleLoadingSessionUsers(false)
    }, 1000)
  }
  const fetchStudioPostingPage = async (studio_id) => {
    const pp = await getPagesByStudio(studio_id)
    setPostingPages({
      ...postingPages,
      [studio_id]: pp
    })
  }

  const handleStudioArchive = (studio) => {
    const callback = async () => {
      await archiveStudio(studio._id)
    }
    setConfirmMessage(`Want to archive ${studio.name}?`)
    setConfirmCallback(() => callback)
  }
  const handleStudioSubmit = async (result, isCreate) => {
    toggleLoading(true)
    if (isCreate) {
      const newSession = await handleSessionSubmit({name: 'Session'}, result._id)
    }
    toggleLoading(false)
  }

  const handlePostingPageSubmit = async (postingPage={}, studio_id) => {
  }

  const handleSessionSubmit = async (session = {}, studio_id) => {
    toggleLoading(true)
    const name = session.name
    const studioSessions = studio.sessions
    const names = studioSessions.map(s => s.name)
    const originalStudio = studioSessions.find(s => s._id === session._id)
    if (names.includes(name) && studio.sessions
     && (!originalStudio || originalStudio && originalStudio.name !== session.name)
    ) {
      window.alert(`You already have the session ${name}`)
      return
    }
    const formData = new FormData()
    formData.append('name', name)
    if (typeof session.twr === 'string') {
      formData.append('twr', session.twr)
    }
    let datesInfo = [];
    (session.dates || []).forEach((date, idx) => {
      if (date.size_card_pdf) {
        formData.append(`size_card_pdf-${idx}`, date.size_card_pdf)
      }
      if (date.schedule_pdf) {
        formData.append(`schedule_pdf-${idx}`, date.schedule_pdf)
      }
      const singleDate = {}
      if (date.managers && date.managers.length > 0) {
        singleDate.managers = date.managers.map(u => u._id)
      }
      if (date.lobbyManager && date.lobbyManager.length > 0) {
        singleDate.lobbyManager = date.lobbyManager.map(u => u._id)
      }
      if (date.support) {
        singleDate.support = date.support._id
      }
      singleDate.start_time = date.start_time
      singleDate.start_time_type = date.start_time_type
      singleDate.book_status = date.book_status
      singleDate.invite_session_manager = date.invite_session_manager
      singleDate.invite_lobby_manager = date.invite_lobby_manager
      datesInfo.push(singleDate)
    })
    formData.append('dates', JSON.stringify(datesInfo))
    formData.append('description', session.description)
    let result = null
    if (session._id) {
      result = await updateSession(session._id, formData)
    } else {
      formData.append('studio', studio_id)
      result = await createSession(formData)
    }
    toggleLoading(false)
    return result
  }

  const deleteStudioHandle = async (studio) => {
    const callback = async () => {
      await deleteStudio(studio._id)
    }
    setConfirmMessage(`Want to delete ${studio.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleStudioUnArchive = async (studio) => {
    await unArchiveStudio(studio._id)
  }

  const confirmCancel = () => {
    setConfirmCallback(null)
    setConfirmMessage('')
  }

  const confirmYes = () => {
    confirmCallback()
    confirmCancel()
  }
  
  return (
    <div className="col px-5 py-2 project-item" key={studio._id}>
      <div className="d-flex align-items-lg-baseline">
        <h4 className="mr-3">{studio.name}</h4>
        <label className="mr-3 mb-0">{studio.jitsi_meeting_id}</label>
        <label className="mr-3 mb-0">{humanFileSize(studio.size)}</label>
        <div className="action-wrap">
          <FaPen
            className="mr-2"
            onClick={() => {setShowEditModal(true)}} />
          <label
            className="mb-0"
            onClick={() => {setShowCastingDirectorModal(true)}} 
          >
            <FaLink title="Assign Director"/>
            {studio.casting_directors.map(c => {
              return <div className='casting-admin-wrap'>
                <span key={c._id} className="ml-1">{c.email}</span>
                {c.logo ?
                  <img src={static_root + c.logo} />
                : null}
              </div>
            })}
          </label>
          {STUDIO_LIST_PERMISSIONS.CAN_ARCHIVE_STUDIO() && (
            <label
              className="ml-5 text-danger"
              onClick={() => {
                if (!studio.is_archived) {
                  handleStudioArchive(studio)
                } else {
                  handleStudioUnArchive(studio)
                }
              }} 
            >
              {!!studio.is_archived ? <FaBackward title="restore" /> : <FaArchive title="Archive" />}
            </label>
          )}
          {USER_TYPE.IS_SUPER_ADMIN() && (
            <label className="ml-3 text-danger">
              <FaTrash
                title="Delete"
                className="mr-2"
                onClick={() => deleteStudioHandle(studio)}
              />
            </label>
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          className="text-danger ml-auto"
          onClick={() => {setShowCreatePostingPageModal(true)}} 
        >
          Add New Posting Page
        </Button>
        <Button
          variant="link"
          size="sm"
          className="ml-3 text-danger"
          onClick={() => {setShowCreateSessionModal(true)}} 
        >
          Add New Session
        </Button>
      </div>
      <div className="d-flex flex-column">
        {studio.sessions.map(session => (
          <Session
            key={session._id}
            session={session}
            studio={studio}
          />
        ))}
        {(postingPages[studio._id] || []).length > 0 && <hr className="w-100 mt-2 mb-0" />}
        {(postingPages[studio._id] || []).map(pp => (
          <PostingPage
            studio={studio}
            postingPage={pp}
          />
        ))}
      </div>
      <StudioCrupdateModal
        studio={studio}
        show={showEditModal}
        onHide={()=>{setShowEditModal(false)}}
      />
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
      <SessionCrupdateModal
        show={showCreateSessionModal}
        onHide = {() => {setShowCreateSessionModal(false)}}
      />
      <Modal
        size="xl"
        show={showCastingDirectorModal}
        onHide = {() => {setShowCastingDirectorModal(false)}}
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
              setStudioCastingDirector(0)
              setSelectedCastingDirector([])
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
      <PostingPageCrupdateModal
        show={showCreatePostingPageModal}
        onHide={()=>{setShowCreatePostingPageModal(false)}}
      />
    </div>
  )
}