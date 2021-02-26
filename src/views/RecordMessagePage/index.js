import React, { useState, useEffect } from 'react'
import {
  static_root,
  getOneRecord,
  getOneSession,
  getStudioInfo
} from '../../services'
import Linkify from 'linkifyjs/react'
import { Button } from 'react-bootstrap'
import './style.scss'

const RecordMessagePage = ({ match }) => {
  const [message, setMessage] = useState('')
  const [record, setRecord] = useState('')
  const [session, setSession] = useState('')
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
    fetchData()
  }, [match.params.record_id])

  if (!studio) {
    return null
  }

  const logo = studio && studio.logo ? static_root + studio.logo : require('../../assets/heyjoe.png')
  const liveMode = record && record.groups.length > 0 || record.seen
  const meeting_id = !liveMode ? studio.test_meeting_id : studio.jitsi_meeting_id

  return (
    <div className="message-page pt-5">
      <div className="container text-center ">
        <img src={logo} className="studio-logo"/>
        <p className="my-5">
          <Linkify>
            {message}
          </Linkify>
        </p>
        <Button
          variant="danger"
          size="lg"
          target="_blank"
          onClick={() => {
            window.open(`https://meet.heyjoe.io/${meeting_id}`, '_blank')
            // setShowMeetingFrame(!showMeetingFrame)
          }}
        >
          {showMeetingFrame ? 'Leave' : 'Join'} {!liveMode ? 'Virtual Lobby' : 'Meeting' }
        </Button>
      </div>
      {showMeetingFrame &&
        <div className="meeting-frame mt-5">
          <iframe
            title="Meeting"
            width="100%"
            height="100%"
            id="jitsi-meeting-frame"
            src={`https://meet.heyjoe.io/${meeting_id}`}
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen="allowfullscreen">
          </iframe>
        </div>
      }
    </div>
  )
}

export default RecordMessagePage
