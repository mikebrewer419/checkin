import  React, { useState, useEffect } from 'react'
import { MEETING_HOST } from '../../constants'
import { getUser, getUserById } from '../../services'

let loading = false

const MeetFrame = ({ meeting_id }) => {
  const [user, setUser] = useState(null)
  const [api, setApi] = useState(null)
  const [key, setKey]  = useState(0)

  const handleLoad = () => {
    loading = true
    if (!window.JitsiMeetExternalAPI) {
      setTimeout(() => { handleLoad() }, 1000)
    }
    if (api) { api.dispose() }
    const url = new URL(MEETING_HOST)
    window.jitsiApi = new window.JitsiMeetExternalAPI(url.host, {
      roomName: meeting_id,
      parentNode: document.querySelector('#jitsi-frame')
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
    }
  }, [api, user])

  useEffect(() => {
    const u = getUser()
    if (!u) return
    getUserById(u.id).then(setUser)
  }, [])

  return (
    <div id="jitsi-frame" className="no-print">
      <button
        id="reload-jitsi"
        title="Reload Meeting frame"
        onClick={() => { setKey(key + 1) }}
      >⟳</button>
    </div>
  )
}

export default MeetFrame
