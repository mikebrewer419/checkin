import React, { useState, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import moment from 'moment'
import {
  getStudioByUri,
  getOneSession,
  onboardUser,
  static_root
} from '../../services'

import './style.scss'

const Onboard = () => {
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

  const [agent, setAgent] = useState('')
  const [actualCall, setActualCall] = useState(new Date())
  const [interviewNo, setInterviewNo] = useState(1)
  const [role, setRole] = useState('')

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
      session: session._id,
      agent: agent,
      actual_call: actualCall,
      interview_no: interviewNo,
      role: role
    }).then(result => {
      console.log("onSubmjit -> result", result)
      setApiResult(result)
      if (result.record && result.record._id) {
        setShowAlert(true)
      } else {
        setShowMessage(true)
      }
    })
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
            <p>
              <label>Agent</label>
              <input
                value={agent}
                onChange={ev => setAgent(ev.target.value)}
                type="text"
                name="agent"
                id="agent"
              />
            </p>
            <p>
              <label>Role</label>
              <input
                value={role}
                onChange={ev => setRole(ev.target.value)}
                type="text"
                name="role"
                id="role"
              />
            </p>
            <p>
              <label>Interview Number</label>
              <select
                value={interviewNo}
                onChange={ev => setInterviewNo(ev.target.value)}
                name="interviewNo"
                id="interviewNo"
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
