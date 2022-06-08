import React, {
  useContext,
  useEffect,
  useState,
} from 'react'

import {
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
  updateStudio,
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


import {
  update as updateStudioInStore,
} from '../../store/studios'

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
  const dispatch = useDispatch()
  const [postingPages, setPostingPages] = useState({})
  const [loadingSessionUsers, toggleLoadingSessionUsers] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(null)
  const [confirmCallback, setConfirmCallback] = useState(null)

  const [castingDirectors, setCastingDirectors] = useState([])
  const [selectedCastingDirector, setSelectedCastingDirector] = useState(studio.casting_directors)

  const searchCastingDirectors = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      toggleLoadingSessionUsers(true)
      const users = await searchUsers(email, USER_TYPES.CASTING_DIRECTOR)
      setCastingDirectors(users)
      toggleLoadingSessionUsers(false)
    }, 1000)
  }
  
  const handleStudioArchive = (studio) => {
    const callback = async () => {
      await archiveStudio(studio._id)
    }
    setConfirmMessage(`Want to archive ${studio.name}?`)
    setConfirmCallback(() => callback)
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
  const onOKAssignCastingDirector = async () => {
    const formData = new FormData()
    formData.append('casting_directors', selectedCastingDirector.map(it=>it._id))
    const res = await updateStudio(formData, studio._id)
    dispatch(updateStudioInStore(res))
    setShowCastingDirectorModal(false)
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
              return (
                <div
                  key={c._id}
                  className='casting-admin-wrap'
                >
                  <span key={c._id} className="ml-1">{c.email}</span>
                  {c.logo ?
                    <img src={static_root + c.logo} />
                  : null}
                </div>
              )
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
        studio={studio}
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
          <Button
            disabled={!selectedCastingDirector}
            className="btn btn-primary"
            onClick={onOKAssignCastingDirector}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <PostingPageCrupdateModal
        show={showCreatePostingPageModal}
        onHide={()=>{setShowCreatePostingPageModal(false)}}
      />
    </div>
  )
}