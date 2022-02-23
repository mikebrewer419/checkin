import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Webcam from "react-webcam"
import { Modal } from 'react-bootstrap'
import { GoogleLogin } from 'react-google-login';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { register, verifyCaptcha, googleRegister, uploadImage, loginApi, temp_root } from '../../services'
import { USER_TYPES } from '../../constants'
import { dataURLtoFile } from '../../utils'
import './Login.scss'
import { FaArrowLeft } from 'react-icons/fa';

const client_id = process.env.REACT_APP_CLIENT_ID

const Register = ({ history }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [agent, setAgent] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [avatar64, setAvatar64] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  const [formError, setFormError] = useState('')
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [showTermsModal, setShowTermsModal] = useState(false)

  const webcamRef = useRef(null)

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
    formData.append('user_type', USER_TYPES.TALENT)
    formData.append('logo', avatar64)
    formData.append('phone', phoneNumber)
    formData.append('agent', agent)
    formData.append('opt_in', optIn)

    // const captchaVerifyResponse = await verifyCaptcha(token)
    // if (!captchaVerifyResponse.success) {
    //   setError('Captcha verfication failed. Refresh your browser and try again!')
    //   return
    // }
    const response = await register(formData)
    if (response._id) {
      loginApi(email.toLowerCase(), password)
      .then(() => {
        const pUrl = window.localStorage.getItem('prev_url')
        if (pUrl) {
          window.localStorage.removeItem('prev_url')
          window.location.href = pUrl
        } else {
          window.location.href='/login'
        }
      }, (error) => {
        setError(error)
      })
    } else {
      setError(response.error)
    }
  }

  const googleRegisterSuccess = async (response) => {
    const googleUser = response.profileObj
    const registerResponse = await googleRegister({
      email: googleUser.email,
      token: response.tokenId,
      logo: avatar64,
      phone: phoneNumber,
      agent: agent,
      first_name: googleUser.givenName,
      last_name: googleUser.familyName,
      user_type: USER_TYPES.TALENT
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

  const setAvatarImg = async (file) => {
    const stime = + new Date()
    setUploading(true)
    const res = await uploadImage(file)
    setAvatar64(res.name)
    const duration = +new Date() - stime
    setTimeout(() => {
      setUploading(false)
      // hack around waiting content download time.
      // assume download takes same amount of time as upload
    }, duration)
  }

  const takePhoto = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot()
      const file = dataURLtoFile(imageSrc, `${new Date()}.jpg`)
      setAvatarImg(file)
    },
    [webcamRef]
  )

  const googleRegisterFail = (error) => {
    console.log("Google Sign up error: ", error)
  }

  return (
    <div className="d-flex align-items-center flex-column login-page talent-onboard">
      <div className="bg-danger vw-100 p-3 d-flex justify-content-center header">
        {window.is_react_native && (
          <button className='btn btn-text btn-sm text-white back-btn' onClick={() => history.goBack() }>
            <FaArrowLeft />
          </button>
        )}
        <img src={require('../../assets/heyjoe.png')} className="heyjoe-logo white"/>
      </div>
      <div className="register-pane text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center"> Talent Account Registration</h2>

        <p className="text-center mb-5 description-text mt-3 mx-auto">
          Please register on our site and to save your information and check in faster for auditions. You can also add a Profile Photo/Headshot here that will be viewable by the Casting team & Director. We will add more features for talent in the future, so please check back often and Contact Us with any questions.
        </p>

        <div className="row">
          <div className="col col-12 col-sm-6">
            <div className="w-100">
              <label>Profile Photo/Headshot</label>
              <div className="avatar-choose">
                {cameraError || avatar64 ?
                  <img src={avatar64 ? `${temp_root}tmp/${avatar64}` : require('../../assets/camera.png')} />
                :
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    forceScreenshotSourceSize
                    mirrored
                    screenshotFormat="image/jpeg"
                    onUserMediaError={() => { setCameraError(true) }}
                    videoConstraints={{ 
                      width: 4000,
                      height: 4000,
                      facingMode: "user"
                    }}
                    className="camera-wrapper"
                  />
                }
                <input
                  type="file"
                  id="photo"
                  capture="user"
                  accept="image/*"
                  onChange={ev => setAvatarImg(ev.target.files[0])}
                />
                {uploading && <div className="uploading">
                  Uploading ...
                </div>}
                <div className="d-flex justify-content-center">
                  {!cameraError && (!avatar64 ?
                    <button className="btn btn-secondary btn-sm mr-2" onClick={takePhoto}>
                      Take Photo
                    </button>
                  :
                    <button className="btn btn-secondary btn-sm mr-2" onClick={() => {
                      setAvatar64(null)
                    }}>
                      Retake Photo
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    document.querySelector('#photo').click()
                  }}>
                    Browse Photo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col col-12 col-sm-6">
            <div className="row">
              <div className="form-group col col-12 col-sm-6">
                <label>First Name</label>
                <input
                  value={firstName}
                  onChange={ev => setFirstName(ev.target.value)}
                  type="text"
                  name="firstname"
                  id="firstname"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group col col-12 col-sm-6">
                <label>Last Name</label>
                <input
                  value={lastName}
                  onChange={ev => setLastName(ev.target.value)}
                  type="text"
                  name="lastname"
                  id="lastname"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group col col-12 col-sm-6">
                <label>Cell Phone</label>
                <input
                  value={phoneNumber}
                  onChange={ev => setPhoneNumber(ev.target.value)}
                  type="text"
                  name="phone"
                  id="phone"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group col col-12 col-sm-6">
                <label>Agent</label>
                <input
                  value={agent}
                  onChange={ev => setAgent(ev.target.value)}
                  type="text"
                  name="agent"
                  id="agent"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                value={email}
                onChange={ev => setEmail(ev.target.value)}
                type="email"
                name="email"
                id="email"
                className="form-control"
                required
              />
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
          </div>
        </div>

        <p className="text-danger">{`${error || formError || ''}`}</p>
        <div className="form-group">
          <label className="d-flex align-items-center mb-3">
            <input type="checkbox" className="mr-2 w-auto" id="agree-terms" />
            I agree to &nbsp;<a target="_blank" onClick={() => {
              if (window.is_react_native) {
                setShowTermsModal(true)
              } else {
                window.open("https://heyjoe.io/terms-and-conditions/", '_blank')
              }
            }}>terms of service</a>
          </label>
          <label className="d-flex align-items-center full mb-0">
              <input type="checkbox" className="mr-2 w-auto" name="opt_in" checked={optIn} onChange={ev => {
                setOptIn(ev.target.checked)
              }} />
              Opt in to special offers from Hey Joe
          </label>
          {optIn && (
            <div className="full mt-2">
              By submitting this form, you agree to receive marketing text messages from us at the number provided. Message and data rates may apply, Message frequency varies. Reply HELP for help or STOP to cancel.
            </div>
          )}
        </div>
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
        {!window.is_react_native && (<GoogleLogin
          className="w-100 text-center d-flex justify-content-center mt-4"
          clientId={client_id}
          buttonText="Sign up with Google"
          onSuccess={googleRegisterSuccess}
          onFailure={googleRegisterFail}
          cookiePolicy={'single_host_origin'}
        />)}
      </div>
      <Modal
        size="xl"
        className='h-100'
        show={showTermsModal}
        onHide={() => {
          setShowTermsModal(false)
        }}
      >
        <Modal.Body>
          <iframe src="https://heyjoe.io/terms-and-conditions/" className='onboard-terms-frame' />
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-danger' onClick={() => {
            setShowTermsModal(false)
          }}>
            Done
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Register
