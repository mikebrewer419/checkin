import React, { useState, useEffect, useRef } from "react";
import {
  useDispatch,
  useSelector,
} from 'react-redux'
import moment from 'moment'
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import {
  Modal,
  Accordion,
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
} from 'react-bootstrap'

import DateTimePicker from "react-datetime-picker";
import { Editor } from '@tinymce/tinymce-react'
import { FaListAlt, FaTimes } from "react-icons/fa";

import _ from 'lodash'

import {
  static_root,
  searchUsers,
  getManagers,
  updateSession,
  createSession,
} from "../../services";
import {
  SESSION_TIME_TYPE,
  SESSION_BOOK_TYPE,
  USER_TYPES,
  TINYMCE_KEY,
} from "../../constants";
import { update as updateStudioInStore } from '../../store/studios'

let fnTimeoutHandler = null;

export default ({
  show,
  session,
  studio,
  onHide,
}) => {
  const [dateIndex, setDateIndex] = useState(1)
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false);
  const [sessionUsers, setSessionUsers] = useState([]);
  const editorRef = useRef(null)
  const [dates, setDates] = useState(_.get(session, 'dates', []))
  
  const dispatch = useDispatch()

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

  const setDateField = (idx, field, value) => {
    const temp = _.cloneDeep(dates)
    temp[idx][field] = value
    setDates(temp)
  };

  const removeDate = (idx) => {
    const temp = [...dates]
    temp.splice(idx, 1)
    setDates(temp)
  };

  const onAddDateClick = () => {
    setDates([
      ...dates,
      {
        invite_session_manager: false,
        invite_lobby_manager: false,
        managers: [],
        lobbyManager: [],
        start_time: '',
        start_time_type: "1st call",
        book_status: "Book"
      }
    ])
  }
  const onSubmit = (e) => {
    e.preventDefault()
    const buff = new FormData(e.target)
    const formData = new FormData()
    formData.append('name', buff.get('name'))
    formData.append('twr', buff.get('twr'))

    formData.append('dates', JSON.stringify(dates))
    formData.append('description', editorRef.current.getContent())

    if (session) {
      updateSession(session._id, formData).then(res=>{
        const idx = studio.sessions.findIndex(it=>it._id == res._id)
        const sessions = [...studio.sessions]
        sessions[idx] = res
        const temp = {...studio, sessions}
        dispatch(updateStudioInStore(temp))
      })
    } else {
      formData.append('studio', studio._id)
      createSession(formData).then(res=>{
        const sessions = [...studio.sessions, res]
        const temp = {...studio, sessions}
        dispatch(updateStudioInStore(temp))
      })
    }
    onHide()
  }
  
  return (
    <Modal
      show={show}
      size="xl"
      onHide = {onHide}
    >
      <Form
        className="d-flex flex-column h-100"
        onSubmit={onSubmit}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {session ? 'Edit Session': 'Create Session'}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Session Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    defaultValue={_.get(session, 'name', '')}
                  />
                </Form.Group>
                <label>Start time</label>
                <Accordion activeKey={dateIndex}>
                  {dates.map((oneDate, idx) => {
                    return (
                      <Card key={idx}>
                        <Accordion.Toggle
                          as={Card.Header}
                          eventKey={idx + 1}
                        >
                          <div className="d-flex justify-content-between">
                            <label
                              className="mb-0 cursor-pointer"
                              onClick={() => {setDateIndex(dateIndex === (idx + 1) ? -1 : (idx + 1))}}
                            >
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
                            <div className="d-flex mb-3">
                              <DateTimePicker
                                value={oneDate.start_time && new Date(oneDate.start_time)}
                                className="form-control mr-2"
                                onChange={(value) => {
                                  setDateField(idx, "start_time", value);
                                }}
                              />
                              <Form.Control
                                as="select"
                                className="mr-2"
                                defaultValue={oneDate.book_status}
                                onChange={(ev) => {
                                  setDateField(idx, "book_status", ev.target.value);
                                }}
                              >
                                {SESSION_BOOK_TYPE.map((type) => (
                                  <option key={type}>{type}</option>
                                ))}
                              </Form.Control>
                              <Form.Control
                                as="select"
                                defaultValue={oneDate.start_time_type}
                                onChange={(ev) => {
                                  setDateField(idx, "start_time_type", ev.target.value);
                                }}
                              >
                                {SESSION_TIME_TYPE.map((type) => (
                                  <option key={type}>{type}</option>
                                ))}
                              </Form.Control>
                            </div>
                            <label>Session Manager</label>
                            <AsyncTypeahead
                              id="session-user-select"
                              className="mb-1"
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
                            <label className="d-flex align-items-center mb-3">
                              <input defaultChecked={!!oneDate.invite_session_manager} type="checkbox" name="invite_session_manager" className="mr-2" onChange={ev => {
                                setDateField(idx, 'invite_session_manager', ev.target.checked)
                              }} />
                              <span>Invite freelancer session manager</span>
                            </label>
                            <label>Lobby Manager</label>
                            <AsyncTypeahead
                              id="lobby-manager-select"
                              className="mb-1"
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
                            <label className="d-flex align-items-center mb-3">
                              <input defaultChecked={!!oneDate.invite_lobby_manager} type="checkbox" name="invite_session_manager" className="mr-2" onChange={ev => {
                                setDateField(idx, 'invite_lobby_manager', ev.target.checked)
                              }} />
                              <span>Invite freelancer lobby manager</span>
                            </label>
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
                  className="mb-4 mt-1 cursor-pointer mr-5"
                  onClick={onAddDateClick}>
                  + Add Additional Dates/Times
                </span>
                <label>
                  The waitingroom integration.
                  <FaListAlt size="11" className="ml-2" />
                </label>
                <input
                  type="text"
                  name="twr"
                  defaultValue={_.get(session, 'twr', '')}
                  placeholder="Input room_id/studio_uri with no space."
                  className="form-control"
                />
              </Col>
              <Col>
                <label>Description</label>
                <Editor
                  apiKey={TINYMCE_KEY}
                  onInit={(evt, editor) => editorRef.current = editor}
                  initialValue={_.get(session, 'description', '')}
                  init={{
                    height: '100%',
                    menubar: false,
                    plugins: [
                      'advlist autolink lists link image charmap print preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  }}
                />
              </Col>
            </Row>
            
            <hr className="w-100" />
            <div className="d-flex justify-content-end">
              
            </div>
            
          </Container>
        </Modal.Body>
        <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
        >
          Submit
        </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}