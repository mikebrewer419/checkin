import React, { useState, useEffect } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import DateTimePicker from 'react-datetime-picker'
import { FaListAlt } from 'react-icons/fa';
import {
  static_root,
  searchUsers,
  getManagers
} from '../../services'
import { USER_TYPE, USER_TYPES } from '../../constants'

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
        support: selectedSupport && selectedSupport[0] ? selectedSupport[0]._id : null
      },
    )
  }

  const searchSessionUsers = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const sessionUsers = await searchUsers(email, [
        USER_TYPES.SESSION_MANAGER,
        USER_TYPES.CASTING_DIRECTOR,
        USER_TYPES.SUPER_ADMIN
      ])
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
      {(selectedSession.start_time || []).map((st, idx) => {
        return (
          <DateTimePicker
            key={idx}
            value={st && new Date(st)}
            className="form-control"
            onChange={value => {
              const st = [...selectedSession.start_time]
              st.splice(idx, 1, value.toISOString())
              if (!value && selectedSession.start_time.length > 1) {
                st.splice(idx, 1)
              }
              setSelectedSession({
                ...selectedSession,
                start_time: st
              })
            }}
          />
        )
      })}
      <sapn
        className="mb-2 mt-1 cursor-pointer mr-auto"
        onClick={() => {
          setSelectedSession({
            ...selectedSession,
            start_time: selectedSession.start_time.concat(new Date().toISOString())
          })
        }}
      >+ Add Additional Dates/Times</sapn>
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
        className="form-control mb-3"
        onChange={ev => {
          setSelectedSession({
            ...selectedSession,
            schedule_pdf: ev.target.files[0]
          })
        }}
      />
      <label>
        The waitingroom integration.
        <FaListAlt size="11" className="ml-2" />
      </label>
      <input type="text"
        value={selectedSession.twr}
        placeholder="Input room_id/studio_uri with no space."
        className="form-control"
        onChange={ev => {
          setSelectedSession({
            ...selectedSession,
            twr: ev.target.value
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
