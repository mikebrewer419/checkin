import React from 'react'
import classnames from 'classnames'
import ThumbImage from '../../components/ThumbImage'
import { FaCircle, FaMinus, FaUserSlash, FaPencilAlt, FaTimes, FaSms } from 'react-icons/fa'
import { formatHour, formatTime } from '../../utils'

const PersonCard = ({
  idx,
  _id,
  showCallIn,
  group,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen,
  signed_out,
  checked_in_time,
  actual_call,
  setSeen,
  setSkipped,
  setUnSeen,
  signOut,
  removeRecord,
  addToGroup,
  leaveFromGroup,
  hideDelete,
  showLeave,
  updateRecord,
  groups,
  avatar,
  role,
  agent,
  testMode,
  isTwr = false,
  twr_deleted,
  sendSms
}) => {
  const dateString = formatTime(checked_in_time)

  return (
    <div className="video-chat-person-card card text-primary border-0">
      <div className="card-body pr-1">
        <div className="card-title d-flex align-items-center mb-0">
          <h5 className="mr-2 cursor-pointer d-flex align-items-center cursor-pointer" onClick={() => {
            if (addToGroup && !testMode) {
              addToGroup(_id)
            }
          }}>
            {!groups.length && <FaCircle className="text-danger mr-2" />}
            {first_name} {last_name}
          </h5>
          <small className="card-text mb-0">
            Checked In:
            <span className="ml-2">{dateString}</span>
          </small>
          {twr_deleted && <div className="ml-auto">
              <small>Deleted</small>
          </div>}
          <div className={classnames("align-items-center ml-auto", {
            'd-none': isTwr,
            'd-flex': !isTwr
          })}>
            {skipped &&
              <small className="mr-1">skipped</small>}
            {signed_out &&
              <small className="float-right mr-1">Signed out</small>}
            {!signed_out && signOut && !testMode && (
              <FaUserSlash
                className="text-danger ml-auto mr-1 cursor-pointer"
                title="Sign out this user"
                onClick={() => signOut(_id)}
              />
            )}
            {!hideDelete && !testMode && (
              <FaTimes title="Remove" className="text-danger mx-1 cursor-pointer" onClick={() => removeRecord(_id, phone, idx)} />
            )}
            {showLeave && leaveFromGroup && !testMode && (
              <FaMinus title="Leave Group" className="text-danger mx-1 cursor-pointer" onClick={() => leaveFromGroup(_id)} />
            )}
          </div>
        </div>
        <p className="card-text d-none">
          <small>{_id}</small>
        </p>
        <div className="d-flex">
          <div>
            <p className="card-text mb-0">
              <span>Phone:</span>
              <strong className="ml-2">{phone}</strong>
              <label onClick={sendSms} className="d-inline-flex mb-0 ml-2 cursor-pointer" title="Send SMS">
                <FaSms />
              </label>
            </p>
            <p className="card-text mb-0">
              <span>Email:</span>
              <strong className="ml-2">{email}</strong>
            </p>
            <p className="card-text mb-0 actual-call-section">
              <span>Actual Call:</span>
              <strong className="mx-2">{formatHour(actual_call)}</strong>
              {!testMode && !isTwr && (
                <FaPencilAlt className="text-danger edit-trigger cursor-pointer" onClick={() => updateRecord({ _id, actual_call })} />
              )}
            </p>
            <p className="card-text mb-0">
              <span>Role:</span>
              <strong className="ml-2">{role}</strong>
              {!testMode && !isTwr && (
                <FaPencilAlt className="text-danger edit-trigger cursor-pointer" onClick={() => updateRecord({ _id, role })} />
              )}
            </p>
            <p className="card-text mb-0">
              <span>Agent:</span>
              <strong className="ml-2">{agent}</strong>
            </p>
          </div>
          <p className="ml-auto mr-2 mb-0">
            <ThumbImage
              isTwr={isTwr}
              src={avatar}
              className="small-avatar"
              onClick={() => updateRecord({
                _id,
                avatar: avatar || 'empty'
              })}
            />
          </p>
        </div>
        {!isTwr && (
          <div className="d-flex mt-1">
            {!seen && ( <img
              onClick={() => setSeen(_id)}
              className="callin-icon"
              title="Call in"
              src={require('../../assets/callin.png')}
            /> )}
            {seen && ( <img
              onClick={() => setSeen(_id, seen)}
              className="callin-icon"
              title="Call in again"
              src={require('../../assets/callinagain.png')}
            />  )}
            {seen && ( <img
              onClick={() => setUnSeen(_id)}
              className="callin-icon"
              title="Call to Lobby"
              src={require('../../assets/callout.png')}
            />  )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonCard
