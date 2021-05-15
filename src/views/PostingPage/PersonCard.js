import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { FaComment } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
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

const user = getUser()

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
  useSelfData = true,
  number = 0,
  feedbacks,
  comments,
  commentRelateClick,
  twr_id
}) => {
  const [showContact, setShowContact] = useState(false)
  const [record, setRecord] = useState({})
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [content, setContent] = useState('')

  const fetchData = () => {
    if (twr_id) {
      twrGetOneHeyjoeRecord(twr_id).then(data => setRecord(data))
    } else {
      getOneRecord(_id).then(data => setRecord(data))
    }
  }

  useEffect(() => {
    if (useSelfData && POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK()) {
      setInterval(fetchData, 5000)
    } else {
      fetchData()
    }
  }, [])

  const fbks = useSelfData ? (record.feedbacks || {}) : (feedbacks || {})
  const cmts = useSelfData ? (record.comments || []) : (comments || [])

  const myFeedback = fbks[user.email]

  const setMyFeedback = async (feedback) => {
    if(!!twr_id) { await twrSetFeedback(_id, feedback) } else { await setFeedback(_id, feedback) }
    fetchData()
  }

  const addNewComment = async () => {
    if(!!twr_id) { await twrNewComment(_id, content) } else {  await newComment(_id, content) }
    setContent('')
    fetchData()
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
    }}>
      <YesIcon />
      <span>{feedbackCounts['yes']}</span>
    </div>,
    <div key="no" className={"feedback-item " + activeClass('no')} onClick={(ev) => {
      ev.stopPropagation()
      setMyFeedback('no')
    }}>
      <NoIcon />
      <span>{feedbackCounts['no']}</span>
    </div>,
    <div key="maybe" className={"feedback-item " + activeClass('maybe')} onClick={(ev) => {
      ev.stopPropagation()
      setMyFeedback('maybe')
    }}>
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
            <div className={classnames({
              'text-danger': twr_id && !topAvatar && !showNumber
            })}>
              <h5 className="mb-1">{first_name} {last_name}</h5>
              <p className="card-text mb-0">Role: <small>{role}</small></p>
            </div>
            {skipped && !USER_TYPE.IS_CLIENT() && false && <small>&nbsp;&nbsp;skipped</small>}
            <span className="ml-auto myfeedback-icon mt-1">
              {MyFeedbackIcon}
            </span>
          </div>
          <label className={hideContact ? "d-none": "mb-0"} onClick={(ev) => {
            ev.stopPropagation()
            setShowContact(!showContact)
          }}>Contact</label>
          {showContact &&
          <div className="mb-1">
            <p className="card-text mb-0">Phone: <small>{phone}</small></p>
            <p className="card-text mb-0">Email: <small>{email}</small></p>
            <p className="card-text mb-0">Agent: <small>{agent}</small></p>
          </div>}
          {POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
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
              <h5>{first_name} {last_name}</h5>
            </Modal.Header>
            <Modal.Body>
              <div className="personcard-card row">
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
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <span className="myfeedback-icon mr-auto mt-1">
                {MyFeedbackIcon}
              </span>
              {feedbackBar}
            </Modal.Footer>
          </Modal>
        ]
      )}
    </div>
  )
}

export default PersonCard
