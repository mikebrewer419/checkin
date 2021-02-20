import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from 'react-google-login';
import { loginApi, googleLogin, googleRegister } from '../../services'
import { USER_TYPES } from '../../constants'
import './Login.scss'

const client_id = process.env.REACT_APP_CLIENT_ID

const Login = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')

  const doLogin = (email, password) => {
    loginApi(email.toLowerCase(), password)
      .then(() => {
        const pUrl = window.localStorage.getItem('prev_url')
        if (pUrl) {
          window.localStorage.removeItem('prev_url')
          window.location.href = pUrl
        } else {
          window.location.href = '/'
        }
      }, (error) => {
        setError(error)
      })
  }

  useEffect(() => {
    document.title = `Check In | Login`
    if (!localStorage.getItem('alert-dismiss')) {
      document.querySelector('#login-alert').classList.remove('d-none')
    }
  }, [])

  const dismissAlert = () => {
    localStorage.setItem('alert-dismiss', true)
    document.querySelector('#login-alert').classList.add('d-none')
  }

  const googleLoginSuccess = async (response) => {
    const googleUser = response.profileObj
    try {
      await googleRegister({
        email: googleUser.email,
        token: response.tokenId,
        user_type: USER_TYPES.CLIENT
      })
    } catch (err) {
      console.log('pass')
    }
    googleLogin(googleUser.email, response.tokenId)
      .then(() => {
        const pUrl = window.localStorage.getItem('prev_url')
        if (pUrl) {
          window.localStorage.removeItem('prev_url')
          window.location.href = pUrl
        } else {
          window.location.href = '/'
        }
      }, (error) => {
        setError(error)
      })
  }

  const googleLoginFail = (error) => {
    console.log("Google login error: ", error)
  }

  return (
    <div className="d-flex align-items-center flex-column login-page">
      <div className="bg-danger vw-100 p-3 d-flex justify-content-center header">
        <img src={require('../../assets/heyjoe.png')} className="heyjoe-logo white"/>
      </div>
      <div className="text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> WELCOME BACK.</h2>
        <h2 className=" text-center mb-5"> LOGIN HERE. </h2>
        <p id="login-alert" className="d-none">
          Notice, January 15, 2020: If you have used Hey Joe to watch casting sessions in the past, you may have to create a new account to sign in to view your session. We are using a new authentication system for our casting software which requires a fresh registration. Please choose "create account" below. Thank you.
          <a onClick={dismissAlert}>Dismiss</a>
        </p>
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
        <div className="form-group d-flex align-items-center mb-1">
          <input className="mr-1" id="keep-login" type="checkbox" />
          <label htmlFor="keep-login" className="mb-0">
            Keep me logged in.
          </label>
        </div>
        <p className="text-danger">{`${error || ''}`}</p>
        <button
          type="submit"
          className="btn btn-danger"
          onClick={() => doLogin(email, password)}
        >LOG IN</button>
        <div className="form-group d-flex justify-content-between mt-2">
          <Link
            to="/reset-password-request"
            className="font-weight-bold" href="#"
          >Reset password</Link>
          <Link
            to="/register"
            className="font-weight-bold" href="#"
          >Create Account</Link>
        </div>
        <GoogleLogin
          className="w-100 text-center d-flex justify-content-center mt-4 google-btn"
          clientId={client_id}
          buttonText="Login with Google"
          onSuccess={googleLoginSuccess}
          onFailure={googleLoginFail}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    </div>
  )
}

export default Login
