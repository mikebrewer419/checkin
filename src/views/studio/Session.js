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
  Modal
} from 'react-bootstrap'

import {
  FaPen,
  FaLink,
  FaBackward,
  FaArchive,
  FaTrash,
  FaListAlt,
  FaFilm,
  FaUsers,
  FaSearch,
} from 'react-icons/fa';
import { IoMdVideocam } from 'react-icons/io'
import { AiOutlineOrderedList } from 'react-icons/ai'
import { HiOutlineMail } from 'react-icons/hi'
import moment from 'moment'
import {
  createSession,
  updateSession,
  deleteSession,
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
import SendClientEmailModal from './SendClientEmailModal'
import SendTalentEmailModal from './SendTalentEmailModal'
import { ShowLoadingContext } from '../../Context'

const host = window.location.origin

export default ({
  session,
  studio,
}) => {
  const toggleLoading = useContext(ShowLoadingContext)
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(null)
  const [confirmCallback, setConfirmCallback] = useState(null)

  const [emailCheckinLink, setEmailCheckinLink] = useState('')
  const [emailProject, setEmailProject] = useState('')
  const [emailSessionLink, setEmailSessionLink] = useState('')
  const [emailSessionParams, setEmailSessionParams] = useState(null)

  const handleSessionDelete = async (session, studio_id) => {
    const callback = async () => {
      await deleteSession(session._id)
    }
    setConfirmMessage(`Want to delete ${session.name}?`)
    setConfirmCallback(() => callback)
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

  const confirmCancel = () => {
    setConfirmCallback(null)
    setConfirmMessage('')
  }

  const confirmYes = () => {
    confirmCallback()
    confirmCancel()
  }

  return (
    <div className="row mt-1 ml-2 mr-2 align-items-start">
      <div className="col-2 d-flex">
        <div className='d-inline-flex align-items-start'>
          <span className='mr-1'>{session.name}</span>
          {session.twr && (
            <FaListAlt
              size="11"
              className="mr-2"
              title={`TWR - ${session.twr}`}
            />
          )}
        </div>
        <div className='d-flex flex-wrap'>
          {session.dates.map((st, idx) => {
            const stt = st.start_time_type
            let sttClsName = ''
            switch (stt) {
              case SESSION_TIME_TYPE[1]:
                sttClsName = 'text-danger'
                break
            }
            return (
              <a
                key={idx}
                className='mr-2 d-flex align-items-center cursor-pointer'
                title="Send Client Email"
                onClick={() => {
                  setEmailSessionParams(st)
                  setEmailProject(studio)
                  setEmailSessionLink(`${host}/studio/${studio.uri}/${session._id}`)
                }}
              >
                <span className={'mr-0 ' + sttClsName}>
                  {moment(new Date(st.start_time)).format('MM/DD')}
                  {idx < session.dates.length - 1}
                </span>
              </a>
            )
          })}
        </div>
      </div>
      <div className="col-auto" title="Session Video Chat">
        <Link to={`/studio/${studio.uri}/${session._id}`} className="text-danger d-flex mb-0 h4" target="_blank">
          <IoMdVideocam />
        </Link>
      </div>
      <div className="col-auto" title="Virtual Lobby">
        <Link to={`/studio/${studio.uri}/${session._id}?test=true`} className="text-danger d-flex mb-0 h4" target="_blank">
          <FaUsers />
        </Link>
      </div>
      {STUDIO_LIST_PERMISSIONS.CAN_VIEW_ONBOARD() &&
      <div className="col-auto" title="Session Checkin">
        <Link to={`/onboard/${studio.uri}/${session._id}`} className="text-danger d-flex mb-0 h4"  target="_blank">
          <AiOutlineOrderedList />
        </Link>
      </div>}
      {STUDIO_LIST_PERMISSIONS.CAN_VIEW_VIDEO_REVIEW() &&
      <div className="col-auto" title="Video Review">
        <Link to={`/video/${studio.uri}/${session._id}`}  className="text-danger d-flex mb-0 h4" target="_blank">
          <FaFilm />
        </Link>
      </div>}
      <div className="col-auto">
        <a className="text-danger h4 d-flex mb-0 cursor-pointer" title="Send Talent Email">
          <HiOutlineMail
            title="Send Talent Email"
            onClick={() => {
              setEmailCheckinLink(`${host}/onboard/${studio.uri}/${session._id}`)
            }}
          />
        </a>
      </div>
      <div className="col-auto action-wrap">
        <FaPen
          className="mr-2"
          onClick={() => {setShowEditModal(true)}}
        />
        {USER_TYPE.IS_SUPER_ADMIN() && (
          <FaTrash className="mr-2" onClick={() => handleSessionDelete(session, studio._id)}/>
        )}
        <Link to={`/studios/${studio._id}/sessions/${session._id}/find-freelancer`}>
          <FaSearch />
        </Link>
      </div>
      <SessionCrupdateModal
        show={showEditModal}
        onHide = {()=>{setShowEditModal(false)}}
        session={session}
        handleSessionSubmit = {handleSessionSubmit}
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
      <SendTalentEmailModal
        show={!!emailCheckinLink}
        onHide={() => {
          setEmailCheckinLink(null)
        }}
        emailCheckinLink={emailCheckinLink}
        studio = {emailProject}
      />
     
      <SendClientEmailModal
        show={!!emailProject}
        onHide={() => {
          setEmailProject(null)
          setEmailSessionLink(null)
          setEmailSessionParams(null)
        }}
        studio = {emailProject}
        emailSessionParams = {emailSessionParams}
        emailSessionLink = {emailSessionLink}
      />
    </div>
  )
}