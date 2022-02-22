import React, { useEffect, useRef, useState, forwardRef } from 'react'
import classnames from 'classnames'
import { FaComment, FaPrint, FaPlayCircle, FaPaperPlane } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import ReactToPrint from 'react-to-print'
import YesIcon from '../../components/icons/yes'
import NoIcon from '../../components/icons/no'
import MaybeIcon from '../../components/icons/maybe'
import ThumbImage from '../../components/ThumbImage'
import { 
  twr_static_host,
  static_root,
  getOneRecord,
  setFeedback,
  getUser,
  twrGetOneHeyjoeRecord,
  newComment,
  twrSetFeedback,
  twrNewComment
} from '../../services'
import { POSTINGPAGE_PERMISSIONS, USER_TYPE } from '../../constants'
import './personcard.scss'
import { formatHour } from '../../utils'

const user = getUser()

const TalentPrintCard = forwardRef(({
  avatar,
  studio,
  first_name,
  last_name,
  ts_root,
  role,
  cmts,
  phone,
  email,
  agent,
  actual_call,
  hideContact,
  hideFeedbackComments = false
}, ref) => {
  return (
    <div className="w-100" ref={ref}>
      <div className="row">
        <div className="col-9">
          <h4 className="mb-3">
            {first_name}&nbsp;{last_name}
          </h4>
          <img
            className="d-block col-6 mb-4"
            src={avatar ? ts_root+avatar : require('../../assets/camera.png')}
          />
          <h5>Info</h5>
          <div className="d-flex">
            <label>Role: </label>
            <span>{role}</span>
          </div>
          {!hideContact && (
            <div className="d-flex flex-column">
              <p className="card-text mb-0">Phone: <small>{phone}</small></p>
              <p className="card-text mb-0">Email: <small>{email}</small></p>
              <p className="card-text mb-0">Agent: <small>{agent}</small></p>
            </div>
          )}
        </div>
        <div className="col-3">
          {studio && (
            <img src={static_root+studio.logo} alt={studio.name} className="w-100" />
          )}
        </div>
      </div>
      {!hideFeedbackComments && (
        <div className="mt-3">
          <h6>Comments</h6>
          {cmts.map((comment, idx) => (
            <div key={idx}>
              <label>{comment.by.email}</label>
              <p>{comment.content}</p>
            </div>
          ))}
          {cmts.length === 0 && (
            <div>
              No comments yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
})

const FeedbackContent = forwardRef(({
  avatar,
  ts_root,
  studio,
  role,
  cmts,
  phone,
  email,
  agent,
  hideContact
}, ref) => {
  return (
    <div className={"personcard-card row talent-detail-content"} ref={ref}>
      <div className="col-8">
        <img
          className="w-100"
          src={avatar ? ts_root+avatar : require('../../assets/camera.png')}
        />
      </div>
      <div className="col-4">
        {studio && studio.logo && (
          <img
            className="w-100 mb-5"
            src={static_root+studio.logo}
          />
        )}
        <div className="d-flex flex-column">
          <h5>Info</h5>
          <div className="d-flex">
            <label>Role: </label>
            <span>{role}</span>
          </div>
          {!hideContact && (
            <div className="d-flex flex-column">
              <p className="card-text mb-0">Phone: <small>{phone}</small></p>
              <p className="card-text mb-0">Email: <small>{email}</small></p>
              <p className="card-text mb-0">Agent: <small>{agent}</small></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

const PersonCard = ({
  studio,
  _id,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  avatar,
  topAvatar,
  role,
  agent,
  hideContact = true,
  showNumber = false,
  number = 0,
  feedbacks,
  comments,
  commentRelateClick,
  session_id,
  twr_id,
  actual_call,
  twr_deleted,
  groups,
  showRecordVideosModal,
  hideFeedbackComments = false,
  showCommentInline = false
}) => {
  const [showContact, setShowContact] = useState(false)
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [content, setContent] = useState('')
  const feedbackContentRef = useRef({})

  const fbks = (feedbacks || {})
  const cmts = (comments || [])

  const myFeedback = fbks[user.email]

  const setMyFeedback = async (feedback) => {
    if(!!twr_id) { await twrSetFeedback(_id, feedback) } else { await setFeedback(_id, feedback) }
  }

  const addNewComment = async () => {
    if(!!twr_id) { await twrNewComment(_id, content) } else {  await newComment(_id, content) }
    setContent('')
  }

  const activeClass = (feedback) => {
    if (myFeedback === feedback) {
      return 'active'
    }
  }

  let MyFeedbackIcon = null

  if (POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK()) {
    switch(myFeedback) {
      case 'yes':
        MyFeedbackIcon = <YesIcon />
        break
      case 'no':
        MyFeedbackIcon = <NoIcon />
        break
      case 'maybe':
        MyFeedbackIcon = <MaybeIcon />
        break
    }
  }

  let feedbackCounts = {
    yes: 0,
    no: 0,
    maybe: 0
  }
  let feedbackUsers = {
    'yes': [],
    'no': [],
    'maybe': []
  }
  Object.keys(fbks).forEach(email => {
    const v = fbks[email]
    feedbackUsers[v] = feedbackUsers[v].concat(email)
  })

  Object.values(fbks).forEach(value => {
    if (isNaN(feedbackCounts[value])) {
      return
    }
    feedbackCounts[value] ++
  })

  const feedbackBar = [
    <div key="yes" className={"feedback-item " + activeClass('yes')} onClick={(ev) => {
      ev.stopPropagation()
      setMyFeedback('yes')
    }} title={feedbackUsers['yes'].join('\n')}>
      <YesIcon />
      <span>{feedbackCounts['yes']}</span>
    </div>,
    <div key="no" className={"feedback-item " + activeClass('no')} onClick={(ev) => {
      ev.stopPropagation()
      setMyFeedback('no')
    }} title={feedbackUsers['no'].join('\n')}>
      <NoIcon />
      <span>{feedbackCounts['no']}</span>
    </div>,
    <div key="maybe" className={"feedback-item " + activeClass('maybe')} onClick={(ev) => {
      ev.stopPropagation()
      setMyFeedback('maybe')
    }} title={feedbackUsers['maybe'].join('\n')}>
      <MaybeIcon />
      <span>{feedbackCounts['maybe']}</span>
    </div>
  ]

  const ts_root = twr_id ? `${twr_static_host}/record/` : static_root

  return (
    <div className={classnames("posting-person-card card px-3", {
      'twr-card': !!twr_id
    })}>
      {showNumber &&
        <div className="number">
          {number}
        </div>
      }
      {groups.length > 0 && (
        <div className="play-button" onClick={() => { showRecordVideosModal({
          _id,
          first_name,
          last_name
        }) }}>
          <FaPlayCircle />
        </div>
      )}
      {topAvatar &&
        <ThumbImage
          src={avatar}
          isTwr={!!twr_id}
          className="avatar mt-1"
          onClick={() => { setShowFeedbackModal(true) }}
        />
      }
      <div
        className="card-body px-0 py-1"
        onClick={() => { setShowFeedbackModal(true) }}
      >
        <div className="content">
          <div className="card-title d-flex mb-0">
            <div className={classnames('w-100', {
              'text-danger': twr_id && !topAvatar && !showNumber
            })}>
              <h5 className="mb-1 d-flex align-items-center">
                {first_name} {last_name}
                {twr_deleted && <div className="ml-auto pl-2 mr-2 h6">
                  <small>Deleted</small>
                </div>}
              </h5>
              <div className="mb-2">
                <p className="card-text mb-0 actual-call-section">
                  <span>Actual Call:</span>
                  <strong className="mx-2">{formatHour(actual_call)}</strong>
                </p>
                <p className="card-text mb-0">
                  <span>Role:</span>
                  <strong className="ml-2">{role}</strong>
                </p>
                <label className={hideContact ? "d-none": "mb-0"} onClick={(ev) => {
                  ev.stopPropagation()
                  setShowContact(!showContact)
                }}>Contact</label>
                {showContact &&
                <div>
                  <p className="card-text mb-0">
                    <span>Phone:</span>
                    <strong className="ml-2">{phone}</strong>
                  </p>
                  <p className="card-text mb-0">
                    <span>Email:</span>
                    <strong className="ml-2">{email}</strong>
                  </p>
                  <p className="card-text mb-0">
                    <span>Agent:</span>
                    <strong className="ml-2">{agent}</strong>
                  </p>
                </div>}
              </div>
            </div>
            {skipped && !USER_TYPE.IS_CLIENT() && false && <small>&nbsp;&nbsp;skipped</small>}
            <span className="ml-auto myfeedback-icon mt-1">
              {MyFeedbackIcon}
            </span>
          </div>
          {!hideFeedbackComments && POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
            <div className="d-flex align-items-start">
              {feedbackBar}
              <div
                data-id={_id}
                className={"commentor ml-auto " + (commentRelateClick ? '' : 'main-commentor')} onClick={(ev) => {
                  ev.stopPropagation()
                  if (commentRelateClick) {
                    const elem = document.querySelector(`.main-commentor[data-id="${_id}"]`)
                    elem.click()
                  } else {
                    setCommentsVisible(true)
                  }
                }}
              >
                <FaComment className="ml-5 no-print" />
                <span className="ml-1 no-print">{cmts.length}</span>
                <div className="print-only">
                  {cmts.map((comment, idx) => (
                    <div className="mb-1" key={idx}>
                      <label className="mb-0">{comment.by.email}</label>
                      <p className="mb-0">
                        <em>{comment.content}</em>
                      </p>
                    </div>
                  ))}
                  {cmts.length === 0 && (
                    <div>
                      No comments.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {showCommentInline && POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
            <div onClick={ev => {
              ev.stopPropagation()
            }} className="d-flex flex-column">
              <label className='h6 my-1'>Comments ({cmts.length})</label>
              {cmts.map((comment, idx) => (
                <div className="mb-1" key={idx}>
                  <label className="mb-0"> - {comment.by.email} - </label>
                  <p className="mb-0">
                    {comment.content}
                  </p>
                </div>
              ))}
              {cmts.length === 0 && (
                <div>
                  No comments.
                </div>
              )}
              <textarea
                className="form-control"
                rows={1}
                value={content}
                onChange={ev => setContent(ev.target.value)}
                placeholder="New comment here"
              ></textarea>
              <button
                className="btn btn-text btn-sm ml-auto mr-3"
                onClick={addNewComment}
                disabled={!content}
                title="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
        {!topAvatar &&
          <ThumbImage
            isTwr={!!twr_id}
            src={avatar}
            className="small-avatar mt-1"
          />
        }
      </div>
      {POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
        [
          <Modal
            key="comment-modal"
            show={commentsVisible}
            onHide={() => setCommentsVisible(false)}
          >
            <Modal.Header closeButton>
              <h5>Comments</h5>
            </Modal.Header>
            <Modal.Body>
              {cmts.map((comment, idx) => (
                <div key={idx}>
                  <label>{comment.by.email}</label>
                  <p>{comment.content}</p>
                </div>
              ))}
              {cmts.length === 0 && (
                <div>
                  No comments yet.
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <textarea
                className="form-control"
                value={content}
                onChange={ev => setContent(ev.target.value)}
              ></textarea>
              <button
                className="btn btn-danger"
                onClick={addNewComment}
                disabled={!content}
              >
                Comment
              </button>
            </Modal.Footer>
          </Modal>
          ,
          <Modal
            key="feedback-modal"
            className="feedback-modal"
            size="lg"
            show={showFeedbackModal}
            onHide={() => setShowFeedbackModal(false)}
          >
            <Modal.Header closeButton>
              <div className="d-flex w-100 align-items-center">
                <h5 className="mr-auto">{first_name} {last_name}</h5>
                <ReactToPrint
                  pageStyle={"@page { padding: 50px 30px; }"}
                  documentTitle={`${first_name} ${last_name}`}
                  trigger={() => {
                    return (
                      <label class="cursor-pointer">
                        <FaPrint />
                        Print
                      </label>
                    )
                  }}
                  content={() => feedbackContentRef.current}
                />
              </div>
            </Modal.Header>
            <Modal.Body>
              <FeedbackContent
                ts_root={ts_root}
                studio={studio}
                avatar={avatar}
                role={role}
                phone={phone}
                email={email}
                agent={agent}
                hideContact={hideContact}
              />
              <div className="d-none">
                <TalentPrintCard
                  ref={feedbackContentRef}
                  first_name={first_name}
                  last_name={last_name}
                  cmts={cmts}
                  ts_root={ts_root}
                  studio={studio}
                  avatar={avatar}
                  role={role}
                  phone={phone}
                  email={email}
                  agent={agent}
                  hideContact={hideContact}
                  hideFeedbackComments={hideFeedbackComments}
                />
              </div>
            </Modal.Body>
            {!hideFeedbackComments && (
              <Modal.Footer>
                <span className="myfeedback-icon mr-auto mt-1">
                  {MyFeedbackIcon}
                </span>
                {feedbackBar}
              </Modal.Footer>
            )}
          </Modal>
        ]
      )}
    </div>
  )
}

export default PersonCard
