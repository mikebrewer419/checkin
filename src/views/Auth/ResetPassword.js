import React, { useState, useEffect } from 'react'
import { resetPassword } from '../../services'
import AuthHeader from './AuthHeader'
import './Login.scss'

const ResetPasswordRequest = (props) => {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    document.title = `Check In | Reset password`;
  }, [])

  useEffect(() => {
    if (passwordConfirm !== password) {
      setFormError('Confirm password does not match')
    } else {
      setFormError('')
    }
  }, [passwordConfirm])

  const validate = () => {
    if (passwordConfirm !== password) {
      setFormError('Confirm password does not match')
      return false
    }
    setFormError('')
    return true
  }

  const submit = async (password) => {
    try {
      const token = window.location.search.replace('?token=', '')
      const res = await resetPassword(token, password)
      console.log('res: ', res)
      if (res.success) {
        window.alert('Password reset successfully!')
        window.location.href = '/'
      } else {
        setError(res.error)
      }
    } catch (error) {
      setError(error)
    }
  }

  if (!window.location.search.startsWith('?token=')) {
    return 'Invalid Token!'
  }

  return (
    <div className="d-flex align-items-center flex-column vh-100 login-page">
      <AuthHeader history={props.history} />
      <div className="text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> Reset Password.</h2>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={ev => setPassword(ev.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={passwordConfirm}
            onChange={ev => setPasswordConfirm(ev.target.value)}
          />
        </div>
        <p className="text-danger">{`${error || formError || ''}`}</p>
        <button
          type="submit"
          className="btn btn-danger"
          onClick={() => {
            const v =validate()
            if (v) {
              submit(password)
            }
          }}
        >Reset Request</button>
      </div>
    </div>
  )
}

export default ResetPasswordRequest
