import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import {
  static_root,
  getOneRecord,
  getOneSession,
  getStudioInfo,
  getQrCode,
  token
} from '../../services'
import { Modal, Button } from 'react-bootstrap'
import { WS_HOST } from '../../constants'
import { mobileChromeCheck, mobileSafariCheck, copyUrl } from '../../utils'
import './style.scss'
import { NotificationComponent } from '../../App'
import MeetFrame from '../HomePage/MeetFrame'

const RecordMessagePage = ({ match }) => {
  const [message, setMessage] = useState('')
  const [record, setRecord] = useState('')
  const [session, setSession] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [studio, setStudio] = useState(null)
  const [showMeetingFrame, setShowMeetingFrame] = useState(false)
  const [showAppPrompt, setShowAppPrompt] =useState(false)
  const [openAppUrl, setOpenAppUrl] = useState('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const prevSeen = useRef(false)

  const fetchData = async () => {
    const record_id = match.params.record_id
    const newRecord = await getOneRecord(record_id)
    const ss = await getOneSession(newRecord.session)
    const st = await getStudioInfo(ss.studio)
    setSession(ss)
    setStudio(st)
    setMessage(newRecord.lastMessage === "false" ? "You checked in with an invalid phone number. Please check in again with a cell phone number to receive status messages." : newRecord.lastMessage)
    setRecord({
      ...newRecord,
      user_type: 'talent'
    })
    if (newRecord.seen && !record.seen) { setLiveMode(true) }
    if (!newRecord.seen && record.seen) { setLiveMode(false) }

    const onboardUrl = window.location.origin + window.location.pathname
    const auditionData = JSON.stringify({
      talent: newRecord,
      studio: {
        name: st.name,
        logo: st.logo,
        test_meeting_id: st.test_meeting_id,
        jitsi_meeting_id: st.jitsi_meeting_id
      },
      onboard_url: onboardUrl
    })
    setOpenAppUrl(`org.hey.meet://#audition_data=${encodeURIComponent(auditionData)}`)

    const initWS = () => {
      console.log('WS connecting')
      const ws = new WebSocket(WS_HOST)
      ws.onopen = () => {
        ws.send(JSON.stringify({
          meta: 'join',
          room: ss._id,
          token,
          talent: true
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
            setShowMeetingFrame(true)
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
    if (openAppUrl) {
      if (!window.is_react_native) {
        setShowAppPrompt(mobileChromeCheck() || mobileSafariCheck())
      }
    }
  }, [openAppUrl])

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

  if (record.is_deleted) {
    return (
      <div className='message-page pt-2'>
        <div className="row mx-0 align-items-center flex-wrap">
          <img src={logo} className="studio-logo col col-auto mb-2 mb-sm-0 px-2 mr-0 mx-auto mx-sm-0"/>
          <div key="room-name" className="col col-auto">
            <label className="mb-0 h3">
              {studio.name}&nbsp;
              {liveMode ? 'Room' : 'Virtual Lobby'}
            </label>
          </div>
        </div>
        <div className='text-center h6 pt-5'>
          Oops, you need check in again, please 
          <Link
            title="Session Check-In"
            to={`/onboard/${studio.uri}/${session._id}`}
            className="mx-3"
          >
            Click here
          </Link>
        </div>
      </div>
    )
  }

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
        <div key="room-name" className="col col-auto">
          <label className="mb-0 h3">
            {studio.name}&nbsp;
            {liveMode ? 'Room' : 'Virtual Lobby'}
          </label>
        </div>
        {showMeetingFrame ? [
          <p key="message" className="d-none my-2 text-left sms-message col col-lg-4 col-12">
            <strong>Your SMS status messages</strong>
            <br/>
            {message}
          </p>
        ] : null}
        <div className="container text-center ">
          {!showMeetingFrame ? [
            <p key="message" className="my-2 d-none">
              <strong>Your SMS status messages</strong>
              <br/>
              {message}
            </p>,
            JoinButton
          ] : null}
          <Button variant="danger" size="sm" className='ml-2' onClick={async () => {
            setShowQRCode(true)
            if (!qrCodeUrl) {
              const url = window.location.origin + window.location.pathname
              const res = await getQrCode(url)
              setQrCodeUrl(res.url)
            }
          }}>
            { showQRCode && !qrCodeUrl ? 'Loading' : 'Switch devices'}
          </Button>
        </div>
      </div>
      {showMeetingFrame &&
        <MeetFrame
          meeting_id={meeting_id}
          record={record}
          studio={studio}
        />
      }
      <NotificationComponent
        notificationField="client_notice"
        notificationUpdateAtField="client_notice_updated_at"
      />

      <Modal
        size="xl"
        centered
        show={showAppPrompt}
        onHide={() => {
          setShowAppPrompt(false)
        }}
      >
        <Modal.Body>
          Notice: This page should be opened in the Hey Joe app for best performance
        </Modal.Body>
        <Modal.Footer>
          <button className='btn text-danger btn-text' onClick={() => {
            setShowAppPrompt(false)
          }}>
            Cancel
          </button>
          <button className='btn btn-danger' onClick={() => {
            copyUrl(openAppUrl)
            window.open(openAppUrl, '_self')
          }}>
            Open App
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="md"
        centered
        show={showQRCode && qrCodeUrl}
        onHide={() => {
          setShowQRCode(false)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Switch devices
          </h4>
        </Modal.Header>
        <Modal.Body>
          <div className='d-flex flex-column mb-5'>
            <img src={qrCodeUrl} />
            <span>Scan this QR code on a different device to switch devices without checking in again</span>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default RecordMessagePage
