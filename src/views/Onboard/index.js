import React, { useState, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import {
  getStudioByUri,
  getOneSession,
  onboardUser,
  static_root
} from '../../services'

import './style.css'

const Onboard = () => {
  const [firstName, setFirstName] = useState('')
  const [lasttName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sagNumber, setSagNumber] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const { match } = useReactRouter();
  const studio_uri = match.params.uri
  const session_id = match.params.session_id
  const [studio, setStudio] = useState(null)
  const [session, setSession] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const process = async () => {
      const studio = await getStudioByUri(studio_uri)
      const session = await getOneSession(session_id)
      document.title = `${studio.name} Check In`;
      setStudio(studio)
      setSession(session)
    }
    process()
  }, [studio_uri, session_id])

  const onSubmjit = (ev) => {
    ev.preventDefault()
    setSubmitting(true)
    onboardUser({
      first_name: firstName,
      last_name: lasttName,
      email: email,
      phone: phoneNumber,
      sagnumber: sagNumber,
      session: session._id
    }).then(result => {
    console.log("onSubmjit -> result", result)
      if (result.record && result.record._id) {
        setShowAlert(true)
      }
    })
  }

  if (!studio) {
    return <div>No Studio found</div>
  }
  if (!session) {
    return <div>No Session found</div>
  }

  if (showAlert) {
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

  return (
    <div className="container">
      <img
        className="logo d-block m-auto"
        src={static_root+studio.logo}
        alt={studio.name}
      />
      <h3 className="brand mt-4 mb-3">Welcome to {studio.name}/{session.name} Virtual Check In</h3>

      <div className="wrapper">
        <div className="company-info">
          <h3>Check in to {studio.name}</h3>
        </div>
        <div className="contact">
          <form id="contactForm" onSubmit={onSubmjit}>
            <p>
              <label>First Name</label>
              <input
                value={firstName}
                onChange={ev => setFirstName(ev.target.value)}
                type="text"
                name="firstname"
                id="firstname"
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
                required
              />
            </p>
            <p>
              <label>Phone Number</label>
              <input
                value={phoneNumber}
                onChange={ev => setPhoneNumber(ev.target.value)}
                type="text"
                name="phone"
                id="phone"
              />
            </p>
            <p className="full">
              <label>SAG Number</label>
              <input
                value={sagNumber}
                onChange={ev => setSagNumber(ev.target.value)}
                type="text"
                name="sagNumber"
                id="sagNumber"
              />
              <label className="text-secondary">
                If Union, please enter your SAG Number
              </label>
            </p>

            <p className="full">
              <button type="submit" disabled={submitting}>
                Submit
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Onboard
