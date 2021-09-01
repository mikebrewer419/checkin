import React, { useState } from 'react'
import './style.scss'
import { NotificationComponent } from '../../App'

const ClientHomePage = () => {
  const [session, setSession] = useState('')
  return (
    <div className="client-home-page">
      <h4 className="mb-3">You are logged in as USER. Please paste the link below to access the session.</h4>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Session url"
          className="form-control"
          value={session}
          onChange={ev => setSession(ev.target.value)}
        />
      </div>
      <button
        className="btn btn-danger px-5"
        onClick={() => {
          window.location.href = session
        }}
      >
        Go
      </button>
      <NotificationComponent
        notificationField="client_notice"
        notificationUpdateAtField="client_notice_updated_at"
      />
    </div>
  )
}

export default ClientHomePage
