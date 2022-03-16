import  React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { MEETING_HOST } from '../../constants'
import { getUser, getUserById } from '../../services'

let loading = false

const MeetFrame = ({ meeting_id, record, studio }) => {
  const [user, setUser] = useState(null)
  const [api, setApi] = useState(null)
  const [key, setKey]  = useState(0)
  const [hide, setHide] = useState(false)

  const handleLoad = () => {
    loading = true
    if (!window.JitsiMeetExternalAPI) {
      setTimeout(() => { handleLoad() }, 1000)
    }
    if (api) { api.dispose() }
    const url = new URL(MEETING_HOST)
    window.jitsiApi = new window.JitsiMeetExternalAPI(url.host, {
      roomName: meeting_id,
      parentNode: document.querySelector('#iframe-wrapper')
    })
    setApi(window.jitsiApi)
    loading = false
  }

  useEffect(() => {
    if (!loading) {
      handleLoad()
    }
  }, [key, meeting_id])

  useEffect(() => {
    if (api) {
      const iframe = api.getIFrame()
      iframe.setAttribute('id', 'jitsi-meeting-frame')
    }
  }, [api])

  useEffect(() => {
    if (api && user) {
      api.executeCommand('displayName', `${user.first_name} ${user.last_name} (${user.user_type})`)
      if (record && studio) {
        const iframe = api.getIFrame()
        iframe.setAttribute('src', `${iframe.src}&talent_data=${encodeURIComponent(JSON.stringify(record))}&studio_data=${encodeURIComponent(JSON.stringify(studio))}`)
      }
    }
  }, [api, user])

  useEffect(() => {
    const u = getUser()
    if (u) {
      getUserById(u.id).then(setUser)
    } else if(record) {
      setUser(record)
    }
    if (document.querySelector('.right-frame')) {
      document.querySelector('.right-frame').addEventListener('scroll', () => {
        let offsetTop = document.querySelector('.right-frame').scrollTop
        const threshold = window.innerHeight - 225
        if (offsetTop > threshold) {
          document.querySelector('#jitsi-frame').classList.add('mini-view')
        } else {
          document.querySelector('#jitsi-frame').classList.remove('mini-view')
          setHide(false)
        }
      })
    }
  }, [])

  return (
    <div id="jitsi-frame" className={"no-print " + (hide ? 'hide-frame' : '')}>
      <button
        id="reload-jitsi"
        title="Reload Meeting frame"
        onClick={() => { setKey(key + 1) }}
      >⟳</button>
      <div id="iframe-wrapper">
        <FaTimes className='text-danger h5' id="close" onClick={() => {
          setHide(true)
        }} />
      </div>
    </div>
  )
}

export default MeetFrame
