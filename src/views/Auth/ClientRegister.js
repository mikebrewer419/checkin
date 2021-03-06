import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from 'react-google-login';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { register, verifyCaptcha, googleRegister } from '../../services'
import { USER_TYPES } from '../../constants'
import AuthHeader from './AuthHeader';
import './Login.scss'

const client_id = process.env.REACT_APP_CLIENT_ID

const Register = (props) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [formError, setFormError] = useState('')
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    document.title = `Check In | Register`;
    document.body.style.overflowY = 'auto'
    return () => {
      document.body.style.overflowY = 'hidden'
    }
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
    if (!document.querySelector('#agree-terms').checked) {
      setFormError('You should agree to terms and service.')
      return false
    }
    setFormError('')
    return true
  }

  const doRegister = async (email, password) => {
    const token = await executeRecaptcha()

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('first_name', firstName)
    formData.append('last_name', lastName)
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

  const googleRegisterSuccess = async (response) => {
    const googleUser = response.profileObj
    const registerResponse = await googleRegister({
      email: googleUser.email,
      token: response.tokenId,
      first_name: googleUser.givenName,
      last_name: googleUser.familyName,
      user_type: USER_TYPES.CLIENT
    })
    const token = await executeRecaptcha()
    const captchaVerifyResponse = await verifyCaptcha(token)
    if (!captchaVerifyResponse.success) {
      setError('Captcha verfication failed. Refresh your browser and try again!')
      return
    }
    if (registerResponse._id) {
      window.location.href='/login'
    } else {
      setError(registerResponse.error)
    }
  }

  const googleRegisterFail = (error) => {
    console.log("Google Sign up error: ", error)
  }

  return (
    <div className="d-flex align-items-center flex-column login-page">
      <AuthHeader history={props.history} />
      <div className="register-pane text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> Client Account Registration</h2>
        <p className="text-center mb-5 description-text mt-3">
          Use the form below to register for an account on our site.
          This will allow you client access to Casting Sessions and Video Review pages that you have been sent the link to.<br/>
          Are you a Casting Professional? <a target="blank" href="https://heyjoe.io/#contactus">Contact Us</a> to set up a Casting Director or Session Runner account.
        </p>
        <div className="d-flex w-100">
          <div className="form-group w-50">
            <label htmlFor="first_name">First name</label>
            <input
              type="text"
              required
              className="form-control"
              id="first_name"
              value={firstName}
              onChange={ev => setFirstName(ev.target.value)}
            />
          </div>
          <div className="form-group w-50">
            <label htmlFor="last_name">Last name</label>
            <input
              type="text"
              required
              className="form-control"
              id="last_name"
              value={lastName}
              onChange={ev => setLastName(ev.target.value)}
            />
          </div>
        </div>
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
        <label className="d-flex align-items-center mb-3">
          <input type="checkbox" className="mr-2 w-auto" id="agree-terms" />
          I agree to &nbsp;<a target="_blank" href="https://heyjoe.io/terms-and-conditions/">terms of service</a>
        </label>
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
        <GoogleLogin
          className="w-100 text-center d-flex justify-content-center mt-4"
          clientId={client_id}
          buttonText="Sign up with Google"
          onSuccess={googleRegisterSuccess}
          onFailure={googleRegisterFail}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    </div>
  )
}

export default Register
