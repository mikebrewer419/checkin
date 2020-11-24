import React, { useEffect, useState } from 'react'
import { FaCheck, FaTimes, FaQuestion, FaComment } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import { 
  getOneRecord,
  getUserById,
  setFeedback,
  getUser,
  newComment
} from '../../services'
import { POSTINGPAGE_PERMISSIONS, USER_TYPE } from '../../constants'

const user = getUser()

const PersonCard = ({
  _id,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen
}) => {
  const [showContact, setShowContact] = useState(false)
  const [record, setRecord] = useState({})
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [content, setContent] = useState('')
  const [recordCache, setRecordCache] = useState({})

  const commentorIds = (record.comments || []).map(comment => comment.by)

  const commentorDetector = JSON.stringify(commentorIds)
  console.log('commentorDetector: ', commentorDetector);

  const fetchData = () => {
    getOneRecord(_id).then(data => {
      setRecord(data)
    })
  }

  useEffect(() => {
    let cache = { ...recordCache }
    Promise.all(commentorIds.map(async id => {
      if (!recordCache[id] && !cache[id]) {
        const r = await getUserById(id)
        cache[id] = r
      }
    })).then(() => {
      console.log('cache: ', cache);
      setRecordCache(cache)
    })
  }, [commentorDetector])

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
        MyFeedbackIcon = <FaCheck className="text-success" />
        break
      case 'no':
        MyFeedbackIcon = <FaTimes className="text-danger" />
        break
      case 'maybe':
        MyFeedbackIcon = <FaQuestion className="" />
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
    <div className="card px-4 py-1">
      <div className="card-body px-0">
        <h5 className="card-title d-flex mb-2">
          {first_name} {last_name}
          {skipped && !USER_TYPE.IS_CLIENT() && <small>&nbsp;&nbsp;skipped</small>}
          <span className="ml-auto">
            {MyFeedbackIcon}
          </span>
        </h5>
        <label onClick={() => setShowContact(!showContact)}>Contact</label>
        {showContact &&
        <div className="mb-3">
          <p className="card-text mb-1">P: <small>{phone}</small></p>
          <p className="card-text mb-1">E: <small>{email}</small></p>
        </div>}
        {POSTINGPAGE_PERMISSIONS.CAN_LEAVE_FEEDBACK() && (
          <div className="d-flex align-items-center">
            <div className={"feedback-item " + activeClass('yes')} onClick={() => {
              setMyFeedback('yes')
            }}>
              <FaCheck className={"text-success "} />
              <span>{feedbackCounts['yes']}</span>
            </div>
            <div className={"feedback-item " + activeClass('no')} onClick={() => {
              setMyFeedback('no')
            }}>
              <FaTimes className={"text-danger "} />
              <span>{feedbackCounts['no']}</span>
            </div>
            <div className={"feedback-item " + activeClass('maybe')} onClick={() => {
              setMyFeedback('maybe')
            }}>
              <FaQuestion className={""} />
              <span>{feedbackCounts['maybe']}</span>
            </div>
            <div className="commentor" onClick={() => setCommentsVisible(true)}>
              <FaComment className="ml-5" />
              <span className="ml-1">{(record.comments || []).length}</span>
            </div>
          </div>
        )}
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
                <label>{(recordCache[comment.by] || {}).email || comment.by}</label>
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
