import React, { useState, useEffect } from 'react'
import {
  static_root,
  getOneRecord,
  getOneSession,
  getStudioInfo
} from '../../services'
import Linkify from 'linkifyjs/react'
import { Button } from 'react-bootstrap'
import { MEETING_HOST } from '../../constants'
import './style.scss'

const RecordMessagePage = ({ match }) => {
  const [message, setMessage] = useState('')
  const [record, setRecord] = useState('')
  const [session, setSession] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [studio, setStudio] = useState(null)
  const [showMeetingFrame, setShowMeetingFrame] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const record_id = match.params.record_id
      const record = await getOneRecord(record_id)
      const ss = await getOneSession(record.session)
      const st = await getStudioInfo(ss.studio)
      setSession(ss)
      setStudio(st)
      setMessage(record.lastMessage === "false" ? "You checked in with an invalid phone number. Please check in again with a cell phone number to receive status messages." : record.lastMessage)
      setRecord(record)
    }
    const intervalHandle = setInterval(() => {
      fetchData()
    }, 5000)
    return () => {
      clearInterval(intervalHandle)
    }
  }, [match.params.record_id])

  if (!studio) {
    return null
  }

  const logo = studio && studio.logo ? static_root + studio.logo : require('../../assets/heyjoe.png')
  const meeting_id = !liveMode ? studio.test_meeting_id : studio.jitsi_meeting_id

  const JoinButton =  <Button
    key="join-button"
    variant="danger"
    size="sm"
    target="_blank"
    onClick={() => {
      if (showMeetingFrame) {
        setLiveMode(!liveMode)
      } else {
        setShowMeetingFrame(!showMeetingFrame)
      }
    }}
  >
    Join {!liveMode ^ showMeetingFrame ? 'Virtual Lobby' : 'Casting' }
  </Button>

  return (
    <div className="message-page pt-2">
      <div className="d-flex align-items-center justify-content-between mx-2">
        <img src={logo} className="studio-logo"/>
        {showMeetingFrame ? [
          <div key="room-name d-flex justify-content-center align-items-center">
            <label className="mb-0 h6">
              {studio.name}&nbsp;
              {liveMode ? 'Room' : 'Virtual Lobby'}
            </label>
            <label className="mb-0 ml-3">{meeting_id}</label>
          </div>,
          JoinButton,
          <p key="message" className="my-2">{message}</p>
        ] : null}
      </div>
      <div className="container text-center ">
        {!showMeetingFrame ? [
          <p key="message" className="my-2">{message}</p>,
          JoinButton
        ] : null}
      </div>
      {showMeetingFrame &&
        <div className="meeting-frame mt-3">
          <iframe
            title="Meeting"
            width="100%"
            height="100%"
            id="jitsi-meeting-frame"
            src={`${MEETING_HOST}/${meeting_id}`}
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen="allowfullscreen">
          </iframe>
        </div>
      }
    </div>
  )
}

export default RecordMessagePage
