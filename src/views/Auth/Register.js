import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { register, verifyCaptcha } from '../../services'
import { USER_TYPES } from '../../constants'
import './Login.scss'

const Register = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [formError, setFormError] = useState('')
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    document.title = `Check In | Register`;
  }, [])

  useEffect(() => {
    if (passwordConfirm !== password) {
      setFormError('Confirm password does not match')
    } else {
      setFormError('')
    }
  }, [passwordConfirm])

  const validate = () => {
    if (!email) {
      setFormError('Email required')
      return false
    }
    if (passwordConfirm !== password) {
      setFormError('Confirm password does not match')
      return false
    }
    setFormError('')
    return true
  }

  const doRegister = async (email, password) => {
    const token = await executeRecaptcha()
    console.log('token: ', token)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('user_type', USER_TYPES.CLIENT)
    const captchaVerifyResponse = await verifyCaptcha(token)
    if (!captchaVerifyResponse.success) {
      setError('Captcha verfication failed. Refresh your browser and try again!')
      return
    }
    const response = await register(formData)
    if (response._id) {
      window.location.href='/login'
    } else {
      setError(response.error)
    }
  }

  return (
    <div className="d-flex align-items-center flex-column vh-100 login-page">
      <div className="bg-danger vw-100 p-3 d-flex justify-content-center">
        <img src="https://heyjoe.io/wp-content/uploads/2019/06/heyjoe.png" className="heyjoe-logo white"/>
      </div>
      <div className="text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> WELCOME!</h2>
        <h2 className=" text-center mb-5"> REGISTER HERE. </h2>
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
          <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
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
            const v = validate()
            if (v) {
              doRegister(email, password)
            }
          }}
        >REGISTER</button>
        <div className="form-group d-flex justify-content-center mt-2">
          <span>
            Already have an account? &nbsp;
            <Link to="/login" className="font-weight-bold" href="#">Login</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register
