import React, { useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Form } from 'react-bootstrap'
import { USER_TYPES, USER_TYPE_TEXT } from '../../constants'
import { searchUsers, getUserById } from '../../services'

let fnTimeoutHandler = null

const UserForm = ({
  onClose,
  onSubmit,
  user
}) => {
  const {
    _id,
    first_name,
    last_name,
    email,
    user_type,
    twilio_account_sid,
    twilio_auth_token,
    twilio_from_number,
    comet_chat_appid,
    comet_chat_auth,
    comet_api_key,
    attached_users,
    logo  
  } = user || {}

  const [userType, setUserType] = useState(user_type)
  const [attachedUsers, setAttachedUsers] = useState([])
  const [searchUserList, setSearchUserList] = useState([])
  const [searchUserLoading, setSearchUserLoading] = useState(false)

  useEffect(() => {
    const loadAttachedUsers = async () => {
      const users = await Promise.all((attached_users || []).map(id => getUserById(id)))
      setAttachedUsers(users)
    }
    loadAttachedUsers()
  }, [])

  const submitFields = async (event) => {
    event.preventDefault()
    const form_data = new FormData(event.target)
    await onSubmit(form_data)
  }

  const handleSearchUser = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setSearchUserLoading(true)
      const users = await searchUsers(email, [
        userType
      ])
      setSearchUserList(users)
      setSearchUserLoading(false)
    }, 1000)
  }

  if (!user) return null

  return (
    <form onSubmit={submitFields}>
      <div className="d-flex w-100">
        <div className="form-group w-50">
          <label htmlFor="first_name">First name</label>
          <input type="text" required className="form-control form-control-sm" name="first_name" id="first_name" defaultValue={first_name} />
        </div>
        <div className="form-group w-50">
          <label htmlFor="last_name">Last name</label>
          <input type="text" required className="form-control form-control-sm" name="last_name" id="last_name" defaultValue={last_name} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="email">email</label>
        <input type="text" required className="form-control form-control-sm" name="email" id="email" defaultValue={email} />
      </div>
      <Form.Group controlId="user_type">
        <Form.Label>User Type</Form.Label>
        <Form.Control as="select" custom name="user_type" value={userType} onChange={ev => {
          setUserType(ev.target.value)
        }}>
          {Object.values(USER_TYPES).map(type => (
            <option key={type} value={type}>{USER_TYPE_TEXT[type]}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <div className="form-group">
        <label htmlFor="password">password</label>
        <input type="text" className="form-control form-control-sm" name="password" id="password"
          required={!_id}
          placeholder={_id? "Fill in this field if you want to update password." : "Password"}/>
      </div>
      <hr />
      {![USER_TYPES.SESSION_MANAGER, USER_TYPES.CLIENT].includes(userType) && [
        <div className="form-group" key="twilio_account_sid">
          <label htmlFor="twilio_account_sid">twilio_account_sid</label>
          <input type="text" required className="form-control form-control-sm" name="twilio_account_sid" id="twilio_account_sid" defaultValue={twilio_account_sid} />
        </div>,
        <div className="form-group" key="twilio_auth_token">
          <label htmlFor="twilio_auth_token">twilio_auth_token</label>
          <input type="text" required className="form-control form-control-sm" name="twilio_auth_token" id="twilio_auth_token" defaultValue={twilio_auth_token} />
        </div>,
        <div className="form-group" key="twilio_from_number">
          <label htmlFor="twilio_from_number">twilio_from_number</label>
          <input type="text" required className="form-control form-control-sm" name="twilio_from_number" id="twilio_from_number" defaultValue={twilio_from_number} />
        </div>,
        <div className="form-group" key="comet_chat_appid">
          <label htmlFor="comet_chat_appid">comet_chat_appid</label>
          <input type="text" required className="form-control form-control-sm" name="comet_chat_appid" id="comet_chat_appid" defaultValue={comet_chat_appid} />
        </div>,
        <div className="form-group" key="comet_chat_auth">
          <label htmlFor="comet_chat_auth">comet_chat_auth</label>
          <input type="text" required className="form-control form-control-sm" name="comet_chat_auth" id="comet_chat_auth" defaultValue={comet_chat_auth} />
        </div>,
        <div className="form-group" key="comet_api_key">
          <label htmlFor="comet_api_key">comet_api_key</label>
          <input type="text" required className="form-control form-control-sm" name="comet_api_key" id="comet_api_key" defaultValue={comet_api_key} />
        </div>
      ]}
      {[USER_TYPES.SESSION_MANAGER, USER_TYPES.CASTING_DIRECTOR].includes(userType) && (
        <div className='form-group'>
          <label>Attach { USER_TYPE_TEXT[userType] }</label>
          <AsyncTypeahead
            id="session-user-select"
            className="mb-3"
            multiple
            selected={attachedUsers}
            onChange={value => {
              setAttachedUsers((typeof value === 'string') ? [value] : value)
            }}
            isLoading={searchUserLoading}
            labelKey="email"
            minLength={2}
            onSearch={handleSearchUser}
            options={searchUserList}
            placeholder={`Search for ${USER_TYPE_TEXT[userType]}...`}
          />
        </div>
      )}
      <input type="text" name="attached_users" value={JSON.stringify((attachedUsers || []).map(u => u._id))} className="d-none" />
      <div className="form-group">
        <label htmlFor="logo">logo</label>
        <input type="file" className="form-control" name="logo" id="logo"  accept=".png, .jpg, .jpeg"/>
      </div>
      <button className="btn btn-danger mr-2">
        {_id ? 'Update' : 'Create'}
      </button>
      <label className="btn btn-secondary mb-0" onClick={onClose}>
        Cancel
      </label>
    </form>
  )
}

export default UserForm
