import React, { useState, useEffect } from "react";
import moment from 'moment'
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { Accordion, Card } from 'react-bootstrap'
import DateTimePicker from "react-datetime-picker";
import { FaListAlt, FaTimes } from "react-icons/fa";
import { static_root, searchUsers, getManagers } from "../../services";
import { SESSION_TIME_TYPE, SESSION_BOOK_TYPE, USER_TYPES } from "../../constants";

let fnTimeoutHandler = null;

const SessionForm = ({ session, onSubmit }) => {
  const [selectedSession, setSelectedSession] = useState(session);
  const [selectedSessionManagers, setSelectedSessionManagers] = useState([]);
  const [selectedLobbyManagers, setSelectedLobbyManagers] = useState([]);
  const [sessionUsers, setSessionUsers] = useState([]);
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false);
  const [dateIndex, setDateIndex] = useState(1)

  const handleSubmit = () => {
    onSubmit({
      ...selectedSession,
      managers: selectedSessionManagers.map((m) => m._id),
      lobbyManager: selectedLobbyManagers.map((m) => m._id)
    });
  };

  const searchSessionUsers = async (email) => {
    if (fnTimeoutHandler) {
      clearTimeout(fnTimeoutHandler);
    }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true);
      const sessionUsers = await searchUsers(email, [
        USER_TYPES.SESSION_MANAGER,
        USER_TYPES.CASTING_DIRECTOR,
        USER_TYPES.SUPER_ADMIN,
      ]);
      setSessionUsers(sessionUsers);
      setLoadingSessionUsers(false);
    }, 1000);
  };

  useEffect(() => {
    const fetchSessionManagers = async () => {
      setLoadingSessionUsers(true);
      const { managers, lobbyManager } = await getManagers(
        session._id
      );
      setSelectedSessionManagers(managers);
      setSelectedLobbyManagers(lobbyManager);
      setLoadingSessionUsers(false);
    };
    if (session && session._id) {
      fetchSessionManagers();
    }
  }, [session]);

  const setDateField = (idx, field, value) => {
    const dates = [...(selectedSession.dates || [])];
    dates[idx][field] = value;
    setSelectedSession({
      ...selectedSession,
      dates,
    });
  };

  const removeDate = (idx) => {
    const dates = [...(selectedSession.dates || [])];
    dates.splice(idx, 1);
    setSelectedSession({
      ...selectedSession,
      dates,
    });
  };

  return (
    <div className="d-flex flex-column">
      <label>Session Name</label>
      <input
        type="text"
        className="form-control mb-3"
        value={selectedSession.name}
        onChange={(ev) => {
          setSelectedSession({
            ...selectedSession,
            name: ev.target.value,
          });
        }}
      />
      <label>Start time</label>
      <Accordion activeKey={dateIndex}>
        {(selectedSession.dates || []).map((oneDate, idx) => {
          return (
            <Card key={idx}>
              <Accordion.Toggle as={Card.Header} eventKey={idx + 1}>
                <div className="d-flex justify-content-between">
                  <label className="mb-0 cursor-pointer" onClick={() => {
                    setDateIndex(dateIndex === (idx + 1) ? -1 : (idx + 1))
                  }}>
                    <span className="mr-3">
                      Day {idx + 1}:
                    </span>
                     {`${ moment(oneDate.start_time).format('M/D/YYYY h:m A z')}`} / {oneDate.book_status} /  {oneDate.start_time_type}
                  </label>
                  <label
                    className="mb-0 mt-n1 cursor-pointer"
                    onClick={() => {
                      removeDate(idx);
                      setDateIndex(-1)
                    }}
                  >
                    <FaTimes />
                  </label>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={idx + 1}>
                <Card.Body>
                  <div className="d-flex">
                    <DateTimePicker
                      key={idx}
                      value={oneDate.start_time && new Date(oneDate.start_time)}
                      className="form-control"
                      onChange={(value) => {
                        setDateField(idx, "start_time", value);
                      }}
                    />
                    <select
                      defaultValue={oneDate.book_status}
                      onChange={(ev) => {
                        setDateField(idx, "book_status", ev.target.value);
                      }}
                    >
                      {SESSION_BOOK_TYPE.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                    <select
                      defaultValue={oneDate.start_time_type}
                      onChange={(ev) => {
                        setDateField(idx, "start_time_type", ev.target.value);
                      }}
                    >
                      {SESSION_TIME_TYPE.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <label>Session Manager</label>
                  <AsyncTypeahead
                    id="session-user-select"
                    className="mb-3"
                    selected={oneDate.managers}
                    multiple
                    onChange={(value) => {
                      setDateField(idx, "managers", value);
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
                    selected={oneDate.lobbyManager}
                    multiple
                    onChange={(value) => {
                      setDateField(idx, "lobbyManager", value);
                    }}
                    isLoading={loadingSessionUsers}
                    labelKey="email"
                    minLength={2}
                    onSearch={searchSessionUsers}
                    options={sessionUsers}
                    placeholder="Search for a Session user..."
                  />
                  <label>
                    Sizecard PDF
                    {typeof oneDate.size_card_pdf === "string" && (
                      <a
                        href={`${static_root}${oneDate.size_card_pdf}`}
                        target="_blank"
                        className="ml-2"
                      >
                        View
                      </a>
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={(ev) => {
                      setDateField(idx, "size_card_pdf", ev.target.files[0]);
                    }}
                  />
                  <label>
                    Schedule PDF
                    {typeof oneDate.schedule_pdf === "string" && (
                      <a
                        href={`${static_root}${oneDate.schedule_pdf}`}
                        target="_blank"
                        className="ml-2"
                      >
                        View
                      </a>
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={(ev) => {
                      setDateField(idx, "schedule_pdf", ev.target.files[0]);
                    }}
                  />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          );
        })}
      </Accordion>
      <span
        className="mb-4 mt-1 cursor-pointer mr-auto"
        onClick={() => {
          setSelectedSession({
            ...selectedSession,
            dates: (selectedSession.dates || []).concat({
              start_time: new Date(),
              start_time_type: SESSION_TIME_TYPE[0],
              book_status: SESSION_BOOK_TYPE[0],
              managers: [],
              lobbyManager: [],
            }),
          });
          setDateIndex((selectedSession.dates || []).length + 1)
        }}
      >
        + Add Additional Dates/Times
      </span>
      <label>
        The waitingroom integration.
        <FaListAlt size="11" className="ml-2" />
      </label>
      <input
        type="text"
        value={selectedSession.twr}
        placeholder="Input room_id/studio_uri with no space."
        className="form-control"
        onChange={(ev) => {
          setSelectedSession({
            ...selectedSession,
            twr: ev.target.value,
          });
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
  );
};

export default SessionForm;
