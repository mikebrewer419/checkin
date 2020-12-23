import React, { useEffect, useState } from 'react'
import { FaCheck, FaTimes, FaQuestion, FaComment } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import YesIcon from '../../components/icons/yes'
import NoIcon from '../../components/icons/no'
import MaybeIcon from '../../components/icons/maybe'
import { 
  static_root,
  getOneRecord,
  getUserById,
  setFeedback,
  getUser,
  newComment
} from '../../services'
import { POSTINGPAGE_PERMISSIONS, USER_TYPE } from '../../constants'
import './personcard.scss'

const user = getUser()

const PersonCard = ({
  _id,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  avatar,
  hideAvatar,
  role,
  agent,
  seen
}) => {
  const [showContact, setShowContact] = useState(false)
  const [record, setRecord] = useState({})
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [content, setContent] = useState('')

  const fetchData = () => {
    getOneRecord(_id).then(data => {
      setRecord(data)
    })
  }

  useEffect(() => {
    fetchData()
    if (POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK()) {
      setInterval(fetchData, 5000)
    }
  }, [])

  const myFeedback = (record.feedbacks || {})[user.id]

  const setMyFeedback = async (feedback) => {
    await setFeedback(_id, feedback)
    fetchData()
  }

  const addNewComment = async () => {
    await newComment(_id, content)
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

  Object.values((record.feedbacks || {})).forEach(value => {
    if (isNaN(feedbackCounts[value])) {
      return
    }
    feedbackCounts[value] ++
  })

  return (
    <div className="posting-person-card card px-4 py-1">
      <div className="card-body px-0">
        <div className="content">
          <div className="card-title d-flex mb-2">
            <div>
              <h5>{first_name} {last_name}</h5>
              <p className="card-text mb-0">Role: <small>{role}</small></p>
            </div>
            {skipped && !USER_TYPE.IS_CLIENT() && <small>&nbsp;&nbsp;skipped</small>}
            <span className="ml-auto myfeedback-icon">
              {MyFeedbackIcon}
            </span>
          </div>
          <label onClick={() => setShowContact(!showContact)}>Contact</label>
          {showContact &&
          <div className="mb-3">
            <p className="card-text mb-1">Phone: <small>{phone}</small></p>
            <p className="card-text mb-1">Email: <small>{email}</small></p>
            <p className="card-text mb-0">Agent: <small>{agent}</small></p>
          </div>}
          {POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
            <div className="d-flex align-items-center">
              <div className={"feedback-item " + activeClass('yes')} onClick={() => {
                setMyFeedback('yes')
              }}>
                <YesIcon />
                <span>{feedbackCounts['yes']}</span>
              </div>
              <div className={"feedback-item " + activeClass('no')} onClick={() => {
                setMyFeedback('no')
              }}>
                <NoIcon />
                <span>{feedbackCounts['no']}</span>
              </div>
              <div className={"feedback-item " + activeClass('maybe')} onClick={() => {
                setMyFeedback('maybe')
              }}>
                <MaybeIcon />
                <span>{feedbackCounts['maybe']}</span>
              </div>
              <div className="commentor ml-auto" onClick={() => setCommentsVisible(true)}>
                <FaComment className="ml-5" />
                <span className="ml-1">{(record.comments || []).length}</span>
              </div>
            </div>
          )}
        </div>
        {!hideAvatar &&
          <img
            src={avatar ? `${static_root}${avatar}` : require('../../assets/camera.png')}
            className="small-avatar"
          />
        }
      </div>
      {POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
        <Modal
          show={commentsVisible}
          onHide={() => setCommentsVisible(false)}
        >
          <Modal.Header closeButton>
            <h5>Comments</h5>
          </Modal.Header>
          <Modal.Body>
            {(record.comments || []).map(comment => (
              <div>
                <label>{comment.by.email}</label>
                <p>{comment.content}</p>
              </div>
            ))}
            {(record.comments || []).length === 0 && (
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
      )}
    </div>
  )
}

export default PersonCard
