import React, { useState, useEffect } from 'react'
import { resetPasswordRequest } from '../../services'
import './Login.scss'

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = `Check In | Reset password request`;
  }, [])

  const sendRequest = async (email) => {
    try {
      const res = await resetPasswordRequest(email)
      if (res.success) {
        window.alert('Please check you email for the reset link!')
        window.location.href = '/'
      } else {
        setError(res.error)
      }
    } catch (error) {
      setError(error)
    }
  }

  return (
    <div className="d-flex align-items-center flex-column vh-100 login-page">
      <div className="bg-danger vw-100 p-3 d-flex justify-content-center">
        <img src="https://heyjoe.io/wp-content/uploads/2019/06/heyjoe.png" className="heyjoe-logo white"/>
      </div>
      <div className="text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> Reset Password.</h2>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            aria-describedby="emailHelp"
            value={email}
            onChange={ev => setEmail(ev.target.value)}
          />
        </div>
        <p className="text-danger">{`${error || ''}`}</p>
        <button
          type="submit"
          className="btn btn-danger"
          onClick={() => sendRequest(email)}
        >Send Reset Request</button>
      </div>
    </div>
  )
}

export default ResetPasswordRequest
