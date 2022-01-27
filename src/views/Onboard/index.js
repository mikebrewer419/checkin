import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useReactRouter from 'use-react-router'
import Webcam from "react-webcam"
import { Modal } from 'react-bootstrap'
import moment from 'moment'
import {
  getStudioByUri,
  getOneSession,
  onboardUser,
  uploadImage,
  static_root,
  temp_root,
  getSessionRoles,
  getUserById,
  getUser
} from '../../services'
import { dataURLtoFile } from '../../utils'
import { RoleEditor } from '../CheckinList'
import { NotificationComponent } from '../../App'
import { USER_TYPES } from '../../constants'

import './style.scss'

const mobileSafariCheck = () => {
  if (window.is_react_native) { return }
  const ua = window.navigator.userAgent
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  const webkit = !!ua.match(/WebKit/i)
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
  if (iOSSafari) {
    const url = `org.hey.meet://?onboard=true&url=${encodeURIComponent(window.location.href+'?nativeFrame=true')}`
    window.open(url, '_self')
    return true
  }
  return false
}

const mobileChromeCheck = () => {
  if (window.is_react_native) { return }
  const ua = window.navigator.userAgent
  const isAndroid = ua.toLowerCase().indexOf("android") > -1
  return isAndroid
}

const Onboard = () => {
  const [user, setUser] = useState(null)

  const [firstName, setFirstName] = useState('')
  const [lasttName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sagNumber, setSagNumber] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [apiResult, setApiResult] = useState({})
  const { match } = useReactRouter();
  const studio_uri = match.params.uri
  const session_id = match.params.session_id
  const [studio, setStudio] = useState(null)
  const [session, setSession] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [avatar64, setAvatar64] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cameraError, setCameraError] = useState(false)

  const [agent, setAgent] = useState('')
  const [actualCall, setActualCall] = useState(new Date())
  const [interviewNo, setInterviewNo] = useState(1)
  const [role, setRole] = useState('')
  const [optIn, setOptIn] = useState(false)

  const [roles, setRoles] = useState([])
  const [isMobileSafari, setIsMobileSafari] = useState(false)
  const [isAppFrame, setIsAppFrame] = useState(false)

  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const webcamRef = useRef(null)

  useEffect(() => {
    setIsAppFrame(window.is_react_native)
    if (!window.is_react_native) {
      setIsMobileSafari(mobileSafariCheck())
      setShowAndroidPrompt(mobileChromeCheck())
    }
    const u = getUser()
    if (u) {
      getUserById(u.id).then(data => {
        if (data.user_type === USER_TYPES.TALENT) {
          setUser(data)
          setFirstName(data.first_name)
          setLastName(data.last_name)
          setAgent(data.agent)
          setPhoneNumber(data.phone)
          setEmail(data.email)
          setOptIn(data.opt_in)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (window.webkit && isMobileSafari) {
      setCameraError(true)
    }
  }, [isMobileSafari])

  useEffect(() => {
    const process = async () => {
      const studio = await getStudioByUri(studio_uri)
      const session = await getOneSession(session_id)
      const rs = await getSessionRoles(session_id)
      document.title = `${studio.name} Check In`;
      setStudio(studio)
      setSession(session)
      setRoles(rs)
    }
    process()
  }, [studio_uri, session_id])

  const takePhoto = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot()
      const file = dataURLtoFile(imageSrc, `${new Date()}.jpg`)
      setAvatarImg(file)
    },
    [webcamRef]
  )

  const onSubmit = (ev) => {
    ev.preventDefault()
    if (phoneNumber.replace(/\D/g,'').length < 10) {
      window.alert('Please input correct phone number!')
      return
    }
    if (!avatar64) {
      window.alert('Please capture/upload a photo of yourself for our log sheet')
      return
    }
    setSubmitting(true)
    onboardUser({
      first_name: firstName,
      last_name: lasttName,
      email: email,
      phone: phoneNumber,
      sagnumber: sagNumber,
      session: session._id,
      agent: agent,
      actual_call: actualCall,
      interview_no: interviewNo,
      role: role,
      avatar: avatar64,
      opt_in: optIn
    }).then(result => {
      console.log("onSubmit -> result", result)
      setApiResult(result)
      if (result.record && result.record._id) {
        try {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onboard', talent: result.record, studio }))
          }
        } catch (err) {
          console.log('IGNORE: react native send info failed.', err)
        }
        setShowAlert(true)
      } else {
        setShowMessage(true)
      }
    })
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

  const logout = () => {
    window.localStorage.removeItem('token')
    window.location.reload(true)
  }

  if (!studio) {
    return <div>No Studio found</div>
  }
  if (!session) {
    return <div>No Session found</div>
  }

  if (showMessage) {
    return (
      <div className="alert">
        {(apiResult || {}).message || 'Process finished.'}
      </div>
    )
  }

  if (showAlert) {
    window.location = `/message/${apiResult.record._id}`
    return (
      <div className="alert">
        Thank you {firstName} {lasttName}. You are successfully checked in to {studio.name}. We will send a text shortly.
      </div>
    )
  }

  if (submitting) {
    return (
      <div className="">
        Processing... Please wait for a moment.
      </div>
    )
  }

  let timeOptions = []
  let time = moment().startOf('day')
  const endDayTime = moment().endOf('day')
  while (true) {
    time = time.add(5, 'minutes')
    if (endDayTime.diff(time) < 0) {
      break
    }
    timeOptions.push({
      value: time.toDate(),
      text: time.format('hh:mm a')
    })
  }

  return (
    <div className="onboard-container">
      {isAppFrame && (
        <div className='d-flex mb-2'>
          <button className='btn btn-text btn-sm text-danger ml-auto' onClick={() => {
            try {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'leave' }))
              }
            } catch (err) {
              console.log('IGNORE: react native send info failed.', err)
            }
          }}>
            Leave
          </button>
        </div>
      )}
      <img
        className="logo d-block m-auto"
        src={static_root+studio.logo}
        alt={studio.name}
      />
      <h3 className="brand mt-4 mb-3">Welcome to {studio.name}/{session.name} Virtual Check In</h3>

      <div className="wrapper">
        <div className="company-info">
          <h3>Check in to {studio.name}</h3>
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
          <div className="text-center mt-2">
            Capture/Upload photo (this helps us know who you are and adds a photo to our log sheet)
          </div>
        </div>
        <div className="contact">
          <div className="text-center mb-2 mt-n2">
            {user ?
              <div>
                {`Logged in as ${user.first_name} ${user.last_name}`}
                <a
                  className="cursor-pointer ml-2"
                  onClick={logout}
                >
                  Logout
                </a>
              </div>
            :
              <Link to="/login">
                Returning User? Login or Sign Up for faster check in
              </Link>
            }
          </div>
          <form id="contactForm" onSubmit={onSubmit}>
            <p>
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
            </p>
            <p>
              <label>Last Name</label>
              <input
                value={lasttName}
                onChange={ev => setLastName(ev.target.value)}
                type="text"
                name="lastname"
                id="lastname"
                className="form-control"
                required
              />
            </p>

            <p>
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
            </p>
            <p>
              <label>Cell Phone (to receive SMS audition instructions)</label>
              <input
                value={phoneNumber}
                onChange={ev => setPhoneNumber(ev.target.value)}
                type="text"
                name="phone"
                id="phone"
                className="form-control"
                required
              />
            </p>
            <p>
              <label>Agent</label>
              <input
                value={agent}
                onChange={ev => setAgent(ev.target.value)}
                type="text"
                name="agent"
                id="agent"
                className="form-control"
              />
            </p>
            <p>
              <label>Role</label>
              <RoleEditor
                selectedRecord={{role: ''}}
                roles={roles}
                setRole={text => {
                  setRole(text)
                }}
              />
            </p>
            <p>
              <label>Interview Number</label>
              <select
                value={interviewNo}
                onChange={ev => setInterviewNo(ev.target.value)}
                name="interviewNo"
                id="interviewNo"
                className="form-control"
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </p>
            <p>
              <label>Actual Call</label>
              <select
                value={actualCall}
                onChange={ev => setActualCall(ev.target.value)}
                name="actualCall"
                id="actualCall"
                className="form-control"
              >
                {timeOptions.map(time => (
                  <option
                    key={time.value}
                    value={time.value}
                  >{time.text}</option>
                ))}
              </select>
            </p>
            <p className="full">
              <label>SAG Aftra Number</label>
              <input
                value={sagNumber}
                onChange={ev => setSagNumber(ev.target.value)}
                type="text"
                name="sagNumber"
                id="sagNumber"
                className="form-control"
              />
              <label className="text-secondary">
                If Union, please enter your SAG Number
              </label>
            </p>

            <div className="full">
              <label className="d-flex align-items-center full">
                <input type="checkbox" className="mr-2 w-auto" required />
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
              </div>
            {optIn && (
              <div className="full">
                By submitting this form, you agree to receive marketing text messages from us at the number provided. Message and data rates may apply, Message frequency varies. Reply HELP for help or STOP to cancel.
              </div>
            )}

            <p className="full">
              <button type="submit" disabled={submitting}>
                Submit
              </button>
            </p>
          </form>
        </div>
      </div>
      <NotificationComponent
        notificationField="client_notice"
        notificationUpdateAtField="client_notice_updated_at"
      />

      <Modal
        size="xl"
        show={showAndroidPrompt}
        onHide={() => {
          setShowAndroidPrompt(false)
        }}
      >
        <Modal.Body>
          Notice: This check in page should be opened in the Hey Joe app for best performance
        </Modal.Body>
        <Modal.Footer>
          <button className='btn text-danger btn-text' onClick={() => {
            setShowAndroidPrompt(false)
          }}>
            Cancel
          </button>
          <a className='btn btn-danger' href={`org.hey.meet://?onboard=true&url=${encodeURIComponent(window.location.href+'?nativeFrame=true')}`} >
            Open App
          </a>
        </Modal.Footer>
      </Modal>
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

export default Onboard
