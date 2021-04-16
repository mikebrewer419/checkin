import React, { useState, useEffect } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import DateTimePicker from 'react-datetime-picker'
import {
  static_root,
  searchUsers,
  getManagers
} from '../../services'
import { USER_TYPES } from '../../constants'

let fnTimeoutHandler = null

const SessionForm = ({ session, onSubmit }) => {
  const [selectedSession, setSelectedSession] = useState(session)
  const [selectedSessionManagers, setSelectedSessionManagers] = useState([])
  const [selectedLobbyManagers, setSelectedLobbyManagers] = useState([])
  const [selectedSupport, setSelectedSupport] = useState()
  const [sessionUsers, setSessionUsers] = useState([])
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false)

  const handleSubmit = () => {
    onSubmit(
      {
        ...selectedSession,
        managers: selectedSessionManagers.map(m => m._id),
        lobbyManager: selectedLobbyManagers.map(m => m._id),
        support: selectedSupport[0] ? selectedSupport[0]._id : null
      },
    )
  }

  const searchSessionUsers = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const sessionUsers = await searchUsers(email, USER_TYPES.SESSION_MANAGER)
      setSessionUsers(sessionUsers)
      setLoadingSessionUsers(false)
    }, 1000)
  }

  useEffect(() => {
    const fetchSessionManagers = async () => {
      setLoadingSessionUsers(true)
      const { managers, lobbyManager, support } = await getManagers(session._id)
      setSelectedSessionManagers(managers)
      setSelectedLobbyManagers(lobbyManager)
      support && setSelectedSupport([support])
      setLoadingSessionUsers(false)
    }
    if (session && session._id) {
      fetchSessionManagers()
    }
  }, [session])

  return (
    <div className="d-flex flex-column">
      <label>Session Name</label>
      <input
        type="text"
        className="form-control mb-3"
        value={selectedSession.name}
        onChange={ev => {
          setSelectedSession({
            ...selectedSession,
            name: ev.target.value
          })
        }}
      />
      <label>Session Manager</label>
      <AsyncTypeahead
        id="session-user-select"
        className="mb-3"
        multiple
        selected={selectedSessionManagers}
        onChange={value => {
          setSelectedSessionManagers(value)
        }}
        isLoading={loadingSessionUsers}
        labelKey="email"
        minLength={2}
        onSearch={searchSessionUsers}
        options={sessionUsers}
        placeholder="Search for a Session user..."
      />
      <label>Lobby Manager</label>
      <AsyncTypeahead
        id="lobby-manager-select"
        className="mb-3"
        multiple
        selected={selectedLobbyManagers}
        onChange={value => {
          setSelectedLobbyManagers(value)
        }}
        isLoading={loadingSessionUsers}
        labelKey="email"
        minLength={2}
        onSearch={searchSessionUsers}
        options={sessionUsers}
        placeholder="Search for a Session user..."
      />
      <label>Support</label>
      <AsyncTypeahead
        id="support-select"
        className="mb-3"
        selected={selectedSupport}
        onChange={value => {
          setSelectedSupport(value)
        }}
        isLoading={loadingSessionUsers}
        labelKey="email"
        minLength={2}
        onSearch={searchSessionUsers}
        options={sessionUsers}
        placeholder="Search for a Session user..."
      />
      <label>Start time</label>
      <DateTimePicker
        value={selectedSession.start_time}
        className="form-control mb-3"
        onChange={value => {
          setSelectedSession({
            ...selectedSession,
            start_time: value
          })
        }}
      />
      <label>
        Sizecard PDF
        {typeof selectedSession.size_card_pdf === 'string' && (
          <a href={`${static_root}${selectedSession.size_card_pdf}`} target="_blank" className="ml-2">
            View
          </a>
        )}
      </label>
      <input
        type="file"
        className="form-control mb-3"
        onChange={ev => {
          setSelectedSession({
            ...selectedSession,
            size_card_pdf: ev.target.files[0]
          })
        }}
      />
      <label>
        Schedule PDF
        {typeof selectedSession.schedule_pdf === 'string' && (
          <a href={`${static_root}${selectedSession.schedule_pdf}`} target="_blank" className="ml-2">
            View
          </a>
        )}
      </label>
      <input
        type="file"
        className="form-control"
        onChange={ev => {
          setSelectedSession({
            ...selectedSession,
            schedule_pdf: ev.target.files[0]
          })
        }}
      />
      <hr className="w-100" />
      <button
        disabled={selectedSession && !selectedSession.name}
        className="btn btn-primary align-self-end"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  )
}

export default SessionForm
