import React, { useState, useEffect, useRef } from 'react'
import classnames from 'classnames'
import {
  static_root,
  getOneRecord,
  getOneSession,
  getStudioInfo
} from '../../services'
import { Button } from 'react-bootstrap'
import { MEETING_HOST, WS_HOST } from '../../constants'
import './style.scss'
import { NotificationComponent } from '../../App'

const RecordMessagePage = ({ match }) => {
  const [message, setMessage] = useState('')
  const [record, setRecord] = useState('')
  const [session, setSession] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [studio, setStudio] = useState(null)
  const [showMeetingFrame, setShowMeetingFrame] = useState(false)
  const prevSeen = useRef(false)

  const fetchData = async () => {
    const record_id = match.params.record_id
    const newRecord = await getOneRecord(record_id)
    const ss = await getOneSession(newRecord.session)
    const st = await getStudioInfo(ss.studio)
    setSession(ss)
    setStudio(st)
    setMessage(newRecord.lastMessage === "false" ? "You checked in with an invalid phone number. Please check in again with a cell phone number to receive status messages." : newRecord.lastMessage)
    setRecord(newRecord)
    if (newRecord.seen && !record.seen) { setLiveMode(true) }
    if (!newRecord.seen && record.seen) { setLiveMode(false) }

    const initWS = () => {
      console.log('WS connecting')
      const ws = new WebSocket(WS_HOST)
      ws.onopen = () => {
        ws.send(JSON.stringify({
          meta: 'join',
          room: ss._id
        }))
      }
      ws.onclose = () => {
        console.log('WS onclose')
        initWS()
      }
      ws.onmessage = (event) => {
        try {
          const ev = JSON.parse(event.data)
          console.log('ev: ', ev);
          if (ev.type === 'record' && ev.data._id === record_id) {
            const nr = ev.data
            setMessage(nr.lastMessage === "false" ? "You checked in with an invalid phone number. Please check in again with a cell phone number to receive status messages." : nr.lastMessage)
            setRecord(nr)
          }
        } catch (err) {
          console.log('socket msg handle err: ', err);
        }
      }
    }
    initWS()
  }
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!record.seen && prevSeen.current) { setLiveMode(false) }
    if (record.seen && !prevSeen.current) { setLiveMode(true) }
    prevSeen.current = record.seen
  }, [record])

  if (!studio) {
    return <div className="message-page justify-content-center align-items-center">
      <img src={require('../../assets/loading.gif')}/>
    </div>
  }

  const logo = studio && studio.logo ? static_root + studio.logo : require('../../assets/heyjoe.png')
  const meeting_id = !liveMode ? studio.test_meeting_id : studio.jitsi_meeting_id
  const calledIn = (record && record.groups.length > 0) || record.seen

  const JoinButton =  <Button
    key="join-button"
    variant="danger"
    size="sm"
    target="_blank"
    className={classnames({
      'd-none': showMeetingFrame && !liveMode && !calledIn,
    })}
    onClick={() => {
      console.log('calledIn: ', calledIn, record);
      if (!showMeetingFrame) {
        setShowMeetingFrame(!showMeetingFrame)
      } else if (calledIn) {
        setLiveMode(!liveMode)
      }
    }}
  >
    Join {!liveMode ^ showMeetingFrame ? 'Virtual Lobby' : 'Casting' }
  </Button>

  return (
    <div className="message-page pt-2">
      <div className="row mx-0 align-items-center flex-wrap">
        <img src={logo} className="studio-logo col col-auto mb-2 mb-sm-0 px-2 mr-0 mx-auto mx-sm-0"/>
        {showMeetingFrame ? [
          <div key="room-name" className="col col-auto">
            <label className="mb-0 h3">
              {studio.name}&nbsp;
              {liveMode ? 'Room' : 'Virtual Lobby'}
            </label>
            <label className="mb-0 ml-3">{meeting_id}</label>
          </div>,
          <div className="col d-flex flex-column align-items-center">
            { calledIn && <label className="h5">It's your turn</label>}
            {JoinButton}
          </div>,
          <p key="message" className="my-2 text-left sms-message col col-lg-4 col-12">
            <strong>Your SMS status messages</strong>
            <br/>
            {message}
          </p>
        ] : null}
      </div>
      <div className="container text-center ">
        {!showMeetingFrame ? [
          <p key="message" className="my-2">
            <strong>Your SMS status messages</strong>
            <br/>
            {message}
          </p>,
          JoinButton
        ] : null}
      </div>
      {showMeetingFrame &&
        <div className="meeting-frame mt-2">
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
      <NotificationComponent
        notificationField="client_notice"
        notificationUpdateAtField="client_notice_updated_at"
      />
    </div>
  )
}

export default RecordMessagePage
