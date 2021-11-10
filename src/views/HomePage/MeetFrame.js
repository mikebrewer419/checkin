import  React, { useState, useCallback, useEffect, Component } from 'react'
import { MEETING_HOST } from '../../constants'

let loading = false

const MeetFrame = ({ meeting_id }) => {
  const [api, setApi] = useState(null)
  const [key, setKey]  = useState(0)

  const handleLoad = () => {
    loading = true
    if (!window.JitsiMeetExternalAPI) {
      setTimeout(() => { handleLoad() }, 1000)
    }
    if (api) { api.dispose() }
    const url = new URL(MEETING_HOST)
    setApi(new window.JitsiMeetExternalAPI(url.host, {
      roomName: meeting_id,
      parentNode: document.querySelector('#jitsi-frame')
    }))
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
