import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import { USER_TYPES } from '../../constants'

const UserForm = ({
  onClose,
  onSubmit,
  user
}) => {
  const {
    _id,
    email,
    user_type,
    twilio_account_sid,
    twilio_auth_token,
    twilio_from_number,
    comet_chat_appid,
    comet_chat_auth,
    comet_api_key,
    logo  
  } = user || {}

  const [userType, setUserType] = useState(user_type)

  const submitFields = async (event) => {
    event.preventDefault()
    const form_data = new FormData(event.target)
    await onSubmit(form_data)
  }

  if (!user) return null

  return (
    <form onSubmit={submitFields}>
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
            <option key={type} value={type}>{type}</option>
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