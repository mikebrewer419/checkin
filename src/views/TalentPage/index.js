import React, { useState, useEffect, useRef } from 'react'
import Webcam from "react-webcam"
import { getUser, getUserById, uploadImage, updateUserFields, temp_root } from '../../services'
import { dataURLtoFile } from '../../utils'
import { USER_TYPES } from '../../constants'
import './style.scss'

const TalentPage = () => {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
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

  const [showPwdFields, setShowPwdFields] = useState(false)

  const webcamRef = useRef(null)

  const loadData = () => {
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
  }

  useEffect(() => {
    loadData()
  }, [])

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

  const updateUser = async () => {
    const v = validate()
    if (v) {
      const fields = {
        email,
        agent,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        password,
        logo: avatar64
      }
      const formData = new FormData()
      Object.keys(fields).forEach(key => {
        formData.append(key, fields[key])
      })
      await updateUserFields(user._id, formData)
      loadData()
    }
  }

  return (
    <div className="talent-page">
      <h3 className="mt-4 mb-3">Profile Information</h3>
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
          <div className="form-group mb-0">
            <label className="mr-2">Email: </label>
            <label className="font-weight-bold">{ email }</label>
          </div>
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

          {showPwdFields && (
            <div className="row">
              <div className="col-6">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={ev => setPassword(ev.target.value)}
                />
              </div>
              <div className="col-6">
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
          )}
          <button className="btn btn-secondary mt-3" onClick={() => {
            setShowPwdFields(!showPwdFields)
            setPassword('')
            setPasswordConfirm('')
          }}>
            {showPwdFields ? 'Cancel' : 'Update Password'}
          </button>
          <p className="text-danger">{`${formError || ''}`}</p>
          <div className="form-group">
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
        </div>
      </div>
      <button
          type="submit"
          className="btn btn-danger float-right"
          onClick={updateUser}
        >Save Profile</button>
    </div>
  )
}

export default TalentPage
