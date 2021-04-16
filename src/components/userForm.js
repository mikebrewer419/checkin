import React, { useState, useEffect } from 'react'
import { USER_TYPES } from '../constants'
import { getUser, getUserById, updateUserFields, verityToken } from '../services/auth'

const Form = ({
  onClose
}) => {
  const [user, setUser] = useState({})

  useEffect(() => {
    getUserById(getUser().id).then(data => setUser(data))
  }, [])

  const {
    first_name,
    last_name,
    twilio_account_sid,
    twilio_auth_token,
    twilio_from_number,
    comet_chat_appid,
    comet_chat_auth,
    comet_api_key,
    user_type,
    logo
  } = user

  const submitFields = async (event) => {
    event.preventDefault()
    const form_data = new FormData(event.target)
    await updateUserFields(user._id, form_data)
    await verityToken()
    onClose()
  }

  const hideFields = !([USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR].includes(user_type))

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
      {!hideFields && [
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
        Update
      </button>
      <label className="btn btn-secondary mb-0" onClick={onClose}>
        Cancel
      </label>
    </form>
  )
}

export default Form
