import React, { useCallback, useEffect, useState } from 'react'
import { FaCheckCircle, FaDownload, FaPause, FaPauseCircle, FaPlay, FaSpinner, FaTimesCircle } from 'react-icons/fa'
import { getUser, checkSync, checkSyncAppStatus, setAppSync } from '../../services'

const user = getUser()

const SYNC_STATUSES = {
  CHECKING:  {
    icon: <FaSpinner className="text-info" />,
    label: 'Checking',
    ActionBtn: () => (
      null
    )
  },
  APP_NOT_RUNNING:  {
    icon: <FaTimesCircle className="text-danger" />,
    label: 'App is not running',
    ActionBtn: () => (
      <button className="btn btn-default btn-sm" onClick={() => {
        window.open('https://heyjoe.io/hey-joe-file-sync')
      }}>
        <FaDownload />
      </button>
    )
  },
  SYNCING:  {
    icon: <FaCheckCircle className="text-success" />,
    label: 'Syncing',
    ActionBtn: ({ setSync }) => (
      <button className="btn btn-default btn-sm" onClick={() => setSync(false)}>
        <FaPause />
      </button>
    )
  },
  NOT_SYNCING:  {
    icon: <FaPauseCircle className="text-warning" />,
    label: 'Not Syncing',
    ActionBtn: ({ setSync }) => (
      <button className="btn btn-default btn-sm" onClick={() => setSync(true)}>
        <FaPlay />
      </button>
    )
  },
}

const SyncComponent = ({ studio, session }) => {
  const [status, setStatus] = useState(SYNC_STATUSES.CHECKING)
  const { _id: sessionId, name: sessionName } = session

  const init = useCallback(async () => {
    try {
      await checkSyncAppStatus()
    } catch (e) {
      setStatus(SYNC_STATUSES.APP_NOT_RUNNING)
      return
    }
    const s = await checkSync(user.email, sessionId)
    setStatus(s.sync ? SYNC_STATUSES.SYNCING : SYNC_STATUSES.NOT_SYNCING)
  })

  const setSync = useCallback(async (sync) => {
    await setAppSync(user.email, sessionId, `${studio.name} - ${sessionName}`, sync)
    setStatus(SYNC_STATUSES.CHECKING)
    await init()
  })

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="d-flex align-items-center">
      {status.icon}
      <span className="ml-2">{status.label}</span>
      <status.ActionBtn setSync={setSync} />
    </div>
  )
}

export default SyncComponent
