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
  Button,
  Modal
} from 'react-bootstrap'

import {
  FaPen,
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
  deleteSession,
} from '../../services'
import './style.scss'

import {
  SESSION_TIME_TYPE,
  USER_TYPE,
  STUDIO_LIST_PERMISSIONS,
} from '../../constants'

import 'react-bootstrap-typeahead/css/Typeahead.css';

import { update as updateStudioInStore} from '../../store/studios'

import SessionCrupdateModal from './SessionCrupdateModal'
import SendClientEmailModal from './SendClientEmailModal'
import SendTalentEmailModal from './SendTalentEmailModal'

const host = window.location.origin

export default ({
  session,
  studio,
}) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [emailCheckinLink, setEmailCheckinLink] = useState('')
  const [emailProject, setEmailProject] = useState('')
  const [emailSessionLink, setEmailSessionLink] = useState('')
  const [emailSessionParams, setEmailSessionParams] = useState(null)
  const dispatch = useDispatch()

  const onDeleteClick = ()=>{
    setShowConfirmModal(true)
  }
  const onDeleteConfirmYesClick = async () => {
    const res = await deleteSession(session._id)
    const idx = studio.sessions.findIndex(it=>it._id == res._id)
    const sessions = [...studio.sessions]
    sessions.splice(idx, 1)
    const temp = {...studio}
    temp.sessions = sessions
    dispatch(updateStudioInStore(temp))
    setShowConfirmModal(false)
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
          <FaTrash className="mr-2" onClick={onDeleteClick}/>
        )}
        <Link to={`/studios/${studio._id}/sessions/${session._id}/find-freelancer`}>
          <FaSearch />
        </Link>
      </div>
      <SessionCrupdateModal
        show={showEditModal}
        onHide = {()=>{setShowEditModal(false)}}
        session={session}
      />
      <Modal
        show={showConfirmModal}
        onHide = {()=>{setShowConfirmModal(false)}}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {`Want to delete ${session.name}?`}
          </h5>
        </Modal.Header>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={onDeleteConfirmYesClick}
          >
            Yes
          </Button>
          <Button
            variant="light"
            onClick={()=>{setShowConfirmModal(false)}}
          >
            Cancel
          </Button>
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