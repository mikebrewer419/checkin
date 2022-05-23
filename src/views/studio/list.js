import React, { useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import clsx from 'classnames'
import { Link } from 'react-router-dom'
import { 
  Modal,
  Form,
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap'
import {Formik} from 'formik'
import { Editor } from '@tinymce/tinymce-react'
import { FaPlus, FaPen, FaTrash, FaLink, FaCopy, FaRegCopy, FaListAlt, FaArchive, FaBackward } from 'react-icons/fa';
import moment from 'moment'
import {
  static_root,
  assignCastingDirector,
  assignManagers,
  getManagers,
  searchUsers,
  getManyStudios,
  generateNewJitsiKey,
  generateNewProjectUri,
  deleteStudio,
  createOrUpdateStudio,
  getStudioSessions,
  getSessionsByStudios,
  getPagesByStudio,
  getPagesByStudios,
  updatePage,
  createPage,
  deletePage,
  createSession,
  updateSession,
  deleteSession,
  archiveStudio,
  unArchiveStudio,
  getUser
} from '../../services'
import StudioForm from './form'
import SessionForm from './SessionForm'
import './style.scss'
import Footer from '../../components/Footer'
import {
  SESSION_TIME_TYPE,
  USER_TYPE,
  USER_TYPES,
  PROJECT_TYPES,
  STUDIO_LIST_PERMISSIONS,
  TINYMCE_KEY
} from '../../constants'
import { humanFileSize }  from '../../utils'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import Pagination from '../../components/Pagination'

const host = window.location.origin

let fnTimeoutHandler = null

const formatDate = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('M/D/YYYY')
  return ''
}

const formatHour = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('H:mm: a')
  return ''
}

const SendClientEmailModal = ({
  show,
  onHide
}) => {
  
  
  // const [sessionManager, setSessionManager] = useState([])
  // const [lobbyManager, setLobbyManager] = useState([])
  // const [toAdditionalEmails, setToAdditionalEmails] = useState([])
  // const [from, setFrom] = useState([])
  // const [ccEmail, setCcEmail] = useState([])
  // const [ccAdditionalEmails, setCcAdditionalEmails] = useState([])

  // const [emailContent, setEmailContent] = useState('')
  

  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query) => {
    setIsLoading(true);
    const sessionUsers = await searchUsers(query, [
      USER_TYPES.SESSION_MANAGER,
      USER_TYPES.CASTING_DIRECTOR,
      USER_TYPES.SUPER_ADMIN,
    ]);
    setOptions(sessionUsers);
    setIsLoading(false);
      
  };
  
 
  return (
    <Modal
      show={show}
      onHide={onHide}
      size='lg'
    >
      <Modal.Header closeButton className="align-items-baseline">
        <h4 className="mb-0 mr-3">
          Send Client Email
        </h4>
      </Modal.Header>
      <Formik
        initialValues={{
          sessionManager: [],
          lobbyManager: [],
          toAdditional: [],
          from: [],
          cc: [],
          ccAdditional: [],
          content: ''
        }}
        validate={values => {
          const errors = {}
          if (values.sessionManager.length == 0) {
            errors.sessionManager = 'Session manager email is required'
          }
          if (values.lobbyManager.length == 0) {
            errors.lobbyManager = 'Lobby manager email is required'
          }
          
          if (values.from.length == 0) {
            errors.from = 'Sender email is required'
          }
          if (values.cc.length == 0) {
            errors.cc = 'CC email is required'
          }
          if (values.content.length == 0) {
            errors.content = 'Email conent is required'
          }
          return errors
        }}
        onSubmit={(values, {setSubmitting})=>{
          const data = {
            to: {
              sessionManager: values.sessionManager[0],
              lobbyManager: values.lobbyManager[0],
              additional: values.toAdditional,
            },
            from: values.from[0],
            cc: {
              cc: values.cc[0],
              additional: values.ccAdditional
            },
            conent: values.content
          }
          console.log(data)
          onHide()
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
          handleSubmit
        })=>(
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Container>
                <Row>
                  <Col md={6}>
                    <fieldset className="border rounded-lg px-3">
                      <legend className="d-inline-block w-auto px-2">To</legend>
                      <Form.Group>
                        <Form.Label>Session Manager</Form.Label>
                        <AsyncTypeahead
                          id="to-session-manager-email"
                          selected={values.sessionManager}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          labelKey="email"
                          minLength={2}
                          placeholder="Search for a additional emails..."
                          options={options}
                          onChange={value=>{setFieldValue('sessionManager', value)}}
                          isInvalid={!!errors.sessionManager}
                        />
                        {errors.sessionManager && (
                          <p className="text-danger position-absolute">{errors.sessionManager}</p>
                        )}
                        
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Lobby Manager</Form.Label>
                        <AsyncTypeahead
                          id="to-lobby-manager-email"
                          selected={values.lobbyManager}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          labelKey="email"
                          minLength={2}
                          placeholder="Search for a additional emails..."
                          options={options}
                          onChange={value=>{setFieldValue('lobbyManager', value)}}
                          isInvalid={!!errors.lobbyManager}
                        />
                        {errors.lobbyManager && (
                          <p className="text-danger position-absolute">{errors.lobbyManager}</p>
                        )}
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Additional Emails</Form.Label>
                        <AsyncTypeahead
                          id="to-additional-emails"
                          multiple
                          selected={values.toAdditional}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          labelKey="email"
                          minLength={2}
                          placeholder="Search for a additional emails..."
                          options={options}
                          onChange={value=>{setFieldValue('toAdditional', value)}}
                        />
                      </Form.Group>
                    </fieldset>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>From</Form.Label>
                      <AsyncTypeahead
                        id="from-email"
                        selected={values.from}
                        isLoading={isLoading}
                        onSearch={handleSearch}
                        labelKey="email"
                        minLength={2}
                        placeholder="Search for a additional emails..."
                        options={options}
                        onChange={value=>{setFieldValue('from', value)}}
                        isInvalid = {!!errors.from}
                      />
                      {errors.from && (
                          <p className="text-danger position-absolute">{errors.from}</p>
                        )}
                    </Form.Group>
                    <fieldset className="border rounded-lg px-3">
                      <legend className="d-inline-block w-auto px-2">CC</legend>
                      <Form.Group>
                        <Form.Label>CC</Form.Label>
                        <AsyncTypeahead
                          id="cc-email"
                          selected={values.cc}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          labelKey="email"
                          minLength={2}
                          placeholder="Search for a additional emails..."
                          options={options}
                          onChange={value=>{setFieldValue('cc', value)}}
                          isInvalid = {!!errors.cc}
                        />
                        {errors.cc && (
                          <p className="text-danger position-absolute">{errors.cc}</p>
                        )}
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Additional Emails</Form.Label>
                        <AsyncTypeahead
                          id="cc-additional-emails"
                          className="mb-3"
                          multiple
                          selected={values.ccAdditional}
                          isLoading={isLoading}
                          onSearch={handleSearch}
                          labelKey="email"
                          minLength={2}
                          placeholder="Search for a additional emails..."
                          options={options}
                          onChange={value=>{setFieldValue('ccAdditional', value)}}
                        />
                      </Form.Group>
                    </fieldset>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>
                    Email
                  </Form.Label>
                  <Editor
                    apiKey={TINYMCE_KEY}
                    init={{
                      height: '40vh',
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
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                    value={values.content}
                    onEditorChange={(newValue, editor) => setFieldValue('content', newValue)}
                  />
                  {errors.content && (
                    <p className="text-danger position-absolute">{errors.content}</p>
                  )}
                </Form.Group>
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="submit"
                variant="primary"
                className="mx-3 px-5"
              >
                Send
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

const StudioList = () => {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({})
  const [studios, setStudios] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [sessions, setSessions] = useState({})
  const [postingPages, setPostingPages] = useState({})
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showStudioDetailFields, setShowStudioDetailFields] = useState(false)
  const [errors, setErrors] = useState({})
  const [studioId, setStudioId] = useState(null)
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmCallback, setConfirmCallback] = useState(null)
  const [archive, setArvhice] = useState(false)

  const [castingDirectors, setCastingDirectors] = useState([])
  const [studioCastingDirector, setStudioCastingDirector] = useState(0)
  const [selectedCastingDirector, setSelectedCastingDirector] = useState(null)
  const [selectedPostingPage, setSelectedPostingPage] = useState(null)

  const [emailCheckinLink, setEmailCheckinLink] = useState('')
  const [emailProject, setEmailProject] = useState('')
  const [emailSessionLink, setEmailSessionLink] = useState('')
  const [emailSessionParams, setEmailSessionParams] = useState(null)

  useEffect(() => {
    if (loading) {
      document.querySelector('.loading').classList.add('show')
    } else {
      document.querySelector('.loading').classList.remove('show')
    }
  }, [loading])

  const searchCastingDirectors = async (email) => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(async () => {
      setLoadingSessionUsers(true)
      const users = await searchUsers(email, USER_TYPES.CASTING_DIRECTOR)
      setCastingDirectors(users)
      setLoadingSessionUsers(false)
    }, 1000)
  }

  const fetchManyStudios = async () => {
    const {studios, count} = await getManyStudios(page, pageSize, searchKey, archive)
    setStudios(studios)
    setPageCount(Math.ceil(count / pageSize))
  }

  const fetchStudioSession = async (studio_id) => {
    const ss = await getStudioSessions(studio_id)
    setSessions({
      ...sessions,
      [studio_id]: ss
    })
  }

  const fetchStudioPostingPage = async (studio_id) => {
    const pp = await getPagesByStudio(studio_id)
    setPostingPages({
      ...postingPages,
      [studio_id]: pp
    })
  }

  const deleteStudioHandle = async (studio) => {
    const callback = async () => {
      setSelectedStudio(null)
      await deleteStudio(studio._id)
      await fetchManyStudios()
    }
    setConfirmMessage(`Want to delete ${studio.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleStudioSubmit = async (result, isCreate) => {
    setLoading(true)
    if (isCreate) {
      const newSession = await handleSessionSubmit({name: 'Session'}, result._id)
      setSelectedSession(newSession)
      setStudioId(result._id)
    }
    await fetchManyStudios()
    setSelectedStudio(null)
    setLoading(false)
  }

  const handleSessionSubmit = async (session = {}, studio_id) => {
    setLoading(true)
    const name = session.name
    const studioSessions = sessions[studio_id] || []
    const names = studioSessions.map(s => s.name)
    const originalStudio = studioSessions.find(s => s._id === session._id)
    if (names.includes(name) && sessions[studio_id]
     && (!originalStudio || originalStudio && originalStudio.name !== session.name)
    ) {
      window.alert(`You already have the session ${name}`)
      return
    }
    const formData = new FormData()
    formData.append('name', name)
    if (typeof session.twr === 'string') {
      formData.append('twr', session.twr)
    }
    let datesInfo = [];
    (session.dates || []).forEach((date, idx) => {
      if (date.size_card_pdf) {
        formData.append(`size_card_pdf-${idx}`, date.size_card_pdf)
      }
      if (date.schedule_pdf) {
        formData.append(`schedule_pdf-${idx}`, date.schedule_pdf)
      }
      const singleDate = {}
      if (date.managers && date.managers.length > 0) {
        singleDate.managers = date.managers.map(u => u._id)
      }
      if (date.lobbyManager && date.lobbyManager.length > 0) {
        singleDate.lobbyManager = date.lobbyManager.map(u => u._id)
      }
      if (date.support) {
        singleDate.support = date.support._id
      }
      singleDate.start_time = date.start_time
      singleDate.start_time_type = date.start_time_type
      singleDate.book_status = date.book_status
      datesInfo.push(singleDate)
    })
    formData.append('dates', JSON.stringify(datesInfo))
    let result = null
    if (session._id) {
      result = await updateSession(session._id, formData)
    } else {
      formData.append('studio', studio_id)
      result = await createSession(formData)
    }
    await fetchStudioSession(studio_id)
    setSelectedSession(null)
    setLoading(false)
    return result
  }

  const handlePostingPageSubmit = async (postingPage={}, studio_id) => {
    setLoading(true)
    const name = postingPage.name
    const names = postingPages[studio_id].map(p => p.name)
    const originalPP = postingPages[studio_id].find(p => p._id === postingPage._id)
    if (names.includes(name) && postingPages[studio_id]
     && (!originalPP || originalPP && originalPP.name !== postingPage.name)
    ) {
      window.alert(`You already have the posting page ${name}`)
      return
    }
    if (postingPage._id) {
      await updatePage(postingPage._id, postingPage)
    } else {
      const newPage = await createPage({
        name,
        studio: studio_id
      })
    }
    await fetchStudioPostingPage(studio_id)
    setSelectedPostingPage(null)
    setLoading(false)
  }

  const handlePPDelete = async (postingPage, studio_id) => {
    const callback = async () => {
      await deletePage(postingPage._id)
      await fetchStudioPostingPage(studio_id)
    }
    setConfirmMessage(`Want to delete ${postingPage.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleSessionDelete = async (session, studio_id) => {
    const callback = async () => {
      await deleteSession(session._id)
      await fetchStudioSession(studio_id)
    }
    setConfirmMessage(`Want to delete ${session.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleStudioArchive = (studio) => {
    const callback = async () => {
      setSelectedStudio(null)
      await archiveStudio(studio._id)
      await fetchManyStudios()
    }
    setConfirmMessage(`Want to archive ${studio.name}?`)
    setConfirmCallback(() => callback)
  }

  const handleStudioUnArchive = async (studio) => {
    await unArchiveStudio(studio._id)
    await fetchManyStudios()
  }

  useEffect(() => {
    if (fnTimeoutHandler) { clearTimeout(fnTimeoutHandler) }
    fnTimeoutHandler = setTimeout(() => {
      fetchManyStudios()
    }, 1000)
  }, [searchKey, archive])

  useEffect(() => {
    document.title = `Hey Joe - Virtual Casting Studio and Auditioning Platform`;
    setUser(getUser())
  }, [])

  useEffect(() => {
    if (window.localStorage.getItem('token')) {
      fetchManyStudios()
    }
  }, [page, pageSize])

  useEffect(() => {
    const fetchAllSessionsAndPPs = async () => {
      if (!studios || studios.length === 0) { return }
      const studioIds = studios.map(s => s._id)
      const allSessions = await getSessionsByStudios(studioIds)
      let ss = {}, pp = {}
      const allPostingPages = await getPagesByStudios(studioIds)
      for(let i = 0; i < studios.length; i ++) {
        ss[studios[i]._id] = allSessions.filter(s => s.studio === studios[i]._id)
        pp[studios[i]._id] = allPostingPages.filter(p => p.studio === studios[i]._id)
      }
      setSessions(ss)
      setPostingPages(pp)
    }
    fetchAllSessionsAndPPs()
  }, [studios])

  const newProjectClick = async () => {
    const { jitsi_meeting_id } = await generateNewJitsiKey()
    const { jitsi_meeting_id: test_meeting_id } = await generateNewJitsiKey()
    const { project_uri } = await generateNewProjectUri()
    setSelectedStudio({
      jitsi_meeting_id,
      test_meeting_id,
      uri: project_uri
    })
    setShowStudioDetailFields(false)
  }

  const confirmCancel = () => {
    setConfirmCallback(null)
    setConfirmMessage('')
  }

  const confirmYes = () => {
    confirmCallback()
    confirmCancel()
  }

  const handleCopyText = (selector) => {
    const str = document.querySelector(selector).innerHTML
    function listener(e) {
      e.clipboardData.setData("text/html", str);
      e.clipboardData.setData("text/plain", str);
      e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
  }

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <label className="h1">
          Projects
        </label>
        <div className="ml-5">
          <input className="form-control" placeholder="Project name"
            value={searchKey} onChange={ev => setSearchKey(ev.target.value)}
          />
        </div>
        <div className="mr-auto ml-5">
          <label className="mb-0 d-flex align-items-center">
            <input type="checkbox" className="mr-2" onChange={(ev) => {
              setArvhice(ev.target.checked)
            }} />
            <span>Show Archive</span>
          </label>
        </div>
        <div className="d-flex">
          {STUDIO_LIST_PERMISSIONS.CAN_CREATE_STUDIO() && (
            <button
              className="btn btn-primary mr-2 d-flex align-items-center"
              onClick={newProjectClick}
            ><FaPlus className="mr-2"/>Create Project</button>
          )}
        </div>
      </div>
      <div className="list-group mb-4">
        {(studios || []).map(studio => (
          <div className="col px-5 py-2 project-item" key={studio._id}>
            <div className="d-flex align-items-lg-baseline">
              <h4 className="mr-3">{studio.name}</h4>
              <label className="mr-3 mb-0">{studio.jitsi_meeting_id}</label>
              <label className="mr-3 mb-0">{humanFileSize(studio.size)}</label>
              <div className="action-wrap">
                <FaPen className="mr-2" onClick={() => {
                  setSelectedStudio(studio)
                  setShowStudioDetailFields(false)
                }}/>
                <label
                  className="mb-0"
                  onClick={() => {
                    setStudioCastingDirector(studio._id)
                    setSelectedCastingDirector(studio.casting_directors)
                  }} 
                >
                  <FaLink title="Assign Director"/>
                  {studio.casting_directors.map(c => {
                    return <div className='casting-admin-wrap'>
                      <span key={c._id} className="ml-1">{c.email}</span>
                      {c.logo ?
                        <img src={static_root + c.logo} />
                      : null}
                    </div>
                  })}
                </label>
                {STUDIO_LIST_PERMISSIONS.CAN_ARCHIVE_STUDIO() && (
                  <label
                    className="ml-5 text-danger"
                    onClick={() => {
                      if (!archive) {
                        handleStudioArchive(studio)
                      } else {
                        handleStudioUnArchive(studio)
                      }
                    }} 
                  >
                    {archive ? <FaBackward title="restore" /> : <FaArchive title="Archive" />}
                  </label>
                )}
                {USER_TYPE.IS_SUPER_ADMIN() && (
                  <label className="ml-3 text-danger">
                    <FaTrash title="Delete" className="mr-2" onClick={() => deleteStudioHandle(studio)}/>
                  </label>
                )}
              </div>
              <label
                className="ml-auto text-danger new-session-btn"
                onClick={() => {
                  setSelectedPostingPage({})
                  setStudioId(studio._id)
                }} 
              >Add New Posting Page</label>
              <label
                className="ml-3 text-danger new-session-btn"
                onClick={() => {
                  setSelectedSession({})
                  setStudioId(studio._id)
                }} 
              >Add New Session</label>
            </div>
            <div className="d-flex flex-column">
              {(sessions[studio._id] || []).map(session => (
                <div key={session._id} className="row mt-1 ml-2 mr-2 align-items-start">
                  <div className="col-2 d-flex">
                    <div className='d-inline-flex align-items-start'>
                      <span className='mr-1'>{session.name}</span>
                      {session.twr && (
                        <FaListAlt size="11" className="mr-2" title={`TWR - ${session.twr}`} />
                      )}
                    </div>
                    <div className='d-flex flex-wrap'>
                      {session.dates.map((st, idx) => {
                        const stt = st.start_time_type
                        let sttClsName = ''
                        switch (stt) {
                          case SESSION_TIME_TYPE[1]:
                            sttClsName = 'text-danger'
                            break
                        }
                        return (
                          <a className='mr-2 d-flex align-items-center cursor-pointer' title="Send Client Email"
                            onClick={() => {
                              setEmailSessionParams(st)
                              setEmailProject(studio)
                              setEmailSessionLink(`${host}/studio/${studio.uri}/${session._id}`)
                            }}
                          >
                            <span className={'mr-0 ' + sttClsName}>
                              {moment(new Date(st.start_time)).format('MM/DD')}
                              {idx < session.dates.length - 1}
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                  <div className="col-auto">
                    <Link to={`/studio/${studio.uri}/${session._id}`} className="text-danger" target="_blank">
                      Session Video Chat
                    </Link>
                  </div>
                  <div className="col-auto">
                    <Link to={`/studio/${studio.uri}/${session._id}?test=true`} className="text-danger" target="_blank">
                      Virtual Lobby
                    </Link>
                  </div>
                  {STUDIO_LIST_PERMISSIONS.CAN_VIEW_ONBOARD() &&
                  <div className="col-auto">
                    <Link to={`/onboard/${studio.uri}/${session._id}`} className="text-danger"  target="_blank">
                      Session Check-In
                    </Link>
                  </div>}
                  {STUDIO_LIST_PERMISSIONS.CAN_VIEW_VIDEO_REVIEW() &&
                  <div className="col-auto">
                    <Link to={`/video/${studio.uri}/${session._id}`}  className="text-danger" target="_blank">
                      Video Review
                    </Link>
                  </div>}
                  <div className="col-auto action-wrap">
                    <FaPen className="mr-2" onClick={() => {
                      setSelectedSession({
                        ...session,
                        start_time: session.start_time
                      })
                      setStudioId(studio._id)
                    }}/>
                    {USER_TYPE.IS_SUPER_ADMIN() && (
                      <FaTrash className="mr-4" onClick={() => handleSessionDelete(session, studio._id)}/>
                    )}
                    <FaCopy
                      className="mr-2" title="Copy Talent Email"
                      onClick={() => {
                        setEmailCheckinLink(`${host}/onboard/${studio.uri}/${session._id}`)
                      }}
                    />
                  </div>
                </div>
              ))}
              {(postingPages[studio._id] || []).length > 0 && <hr className="w-100 mt-2 mb-0" />}
              {(postingPages[studio._id] || []).map(pp => (
                <div key={pp._id} className="row mt-1 ml-2 mr-2">
                  <div className="col-2">
                    {pp.name}
                  </div>
                  <div className="col-auto">
                    <Link to={`/posting-page/${studio.uri}/${pp._id}`} className="text-danger" target="_blank">
                      View Posting Page
                    </Link>
                  </div>
                  <div className="col-auto action-wrap">
                    <FaPen className="mr-2" onClick={() => {
                      setSelectedPostingPage(pp)
                      setStudioId(studio._id)
                    }}/>
                    <FaTrash onClick={() => handlePPDelete(pp, studio._id)}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        pageCount={pageCount}
      />
      <Modal
        show={!!confirmMessage}
        onHide = {confirmCancel}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {confirmMessage}
          </h5>
        </Modal.Header>
        <Modal.Footer>
          <button
            className="btn btn-danger"
            onClick={confirmYes}
          >Yes.</button>
          <button
            className="btn btn-link"
            onClick={confirmCancel}
          >Cancel</button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={!!selectedSession}
        onHide = {() => {
          setSelectedSession(null)
        }}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {selectedSession && selectedSession.name? 'Edit Session': 'Create Session'}
          </h5>
        </Modal.Header>
        {selectedSession && 
          <Modal.Body>
            <SessionForm
              session={selectedSession}
              onSubmit={s => {
                handleSessionSubmit(s, studioId)
              }}
            />
          </Modal.Body>
        }
      </Modal>
      <Modal
        size="xl"
        show={!!studioCastingDirector}
        onHide = {() => {
          setStudioCastingDirector(0)
          setSelectedCastingDirector([])
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Assign Casting Director
          </h4>
        </Modal.Header>
        <Modal.Body>
          <AsyncTypeahead
            id="casting-director-select"
            selected={selectedCastingDirector}
            onChange={value => {
              setSelectedCastingDirector(value)
            }}
            isLoading={loadingSessionUsers}
            labelKey="email"
            minLength={2}
            onSearch={searchCastingDirectors}
            options={castingDirectors}
            placeholder="Search for a Session user..."
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={!selectedCastingDirector}
            className="btn btn-primary"
            onClick={async () => {
              await assignCastingDirector(studioCastingDirector, selectedCastingDirector.map(c => c._id))
              await fetchManyStudios()
              setStudioCastingDirector(0)
              setSelectedCastingDirector([])
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        dialogClassName={clsx({"fullscreen-modal": showStudioDetailFields})}
        show={!!selectedStudio}
        onHide = {() => {
          setSelectedStudio(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {selectedStudio && selectedStudio._id? `Update ${selectedStudio.name}`: 'Create New Project'}
            {(!selectedStudio || !selectedStudio._id) && showStudioDetailFields && <p className="h6 font-weight-normal mt-1">
              Please make sure all credentials are preperly configured for your account.
            </p>}
          </h4>
          {selectedStudio && selectedStudio.casting_directors && selectedStudio.casting_directors.length > 0 && (
            <label className="mb-0">
              <span className="mr-1">Director: </span>
              {selectedStudio.casting_directors.map(director => director.email).join(',')}
            </label>
          )}
        </Modal.Header>
        <Modal.Body className={showStudioDetailFields ? 'overflow-auto' : ''}>
          {selectedStudio &&
            <StudioForm
              showStudioDetailFields={showStudioDetailFields}
              setShowStudioDetailFields={setShowStudioDetailFields}
              studio = {selectedStudio}
              key={selectedStudio._id}
              {...selectedStudio}
              onSubmit={handleStudioSubmit}
              errors={errors}
              onCancel={() => {
                setSelectedStudio(null)
                setErrors({})
              }}
            />}
        </Modal.Body>
      </Modal>
      <Modal
        show={!!selectedPostingPage}
        onHide={() => {
          setSelectedPostingPage(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {selectedPostingPage && selectedPostingPage._id? `Update ${selectedPostingPage.name}`: 'Create New Posting Page'}
          </h4>
        </Modal.Header>
        <Modal.Body>
          {selectedPostingPage && (
            <input
              type="text"
              className="form-control mb-3"
              value={selectedPostingPage.name}
              onChange={ev => {
                setSelectedPostingPage({
                  ...selectedPostingPage,
                  name: ev.target.value
                })
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={selectedPostingPage && !selectedPostingPage.name}
            className="btn btn-primary"
            onClick={() => {
              handlePostingPageSubmit(selectedPostingPage, studioId)
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="xl"
        show={!!emailCheckinLink}
        onHide={() => {
          setEmailCheckinLink(null)
        }}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Copy Talent Email
          </h4>
        </Modal.Header>
        <Modal.Body className="bg-lightgray">
          <div id="talent-email-text">
            <p>You can audition from your phone or computer. Please choose the device that you believe has the best camera and internet connection (a newer smartphone usually works best).</p>
            <p><strong>AUDITION FROM PHONE:</strong><br />
            1. Download and open the Hey Joe app<br />
            iOS: https://apple.co/3grIxwR<br />
            Android: https://bit.ly/2MLDLwL<br />
            2. 15 minutes before your call time, click the link below to check in to the session. Your device will ask if you want to open the link in the Hey Joe app, please click "OK" or "Open":<br />
            <a rel="nofollow noreferrer noopener" target="_blank" href={emailCheckinLink}>{emailCheckinLink}</a>
            <br />
            3. Once you are checked in, please click the "Join Virtual Lobby" button. The casting team will give you instructions for your audition in the virtual lobby<br />
            <strong>AUDITION FROM COMPUTER:</strong><br />
            1. Set up your computer and open Google Chrome (you must use Chrome for best results)<br />
            2. 15 minutes before your call time, click the link below to check in to the session:<br />
            <a rel="nofollow noreferrer noopener" target="_blank" href={emailCheckinLink}>{emailCheckinLink}</a>
            <br />
            3. Once you are checked in, please click the "Join Virtual Lobby" button. The casting team will give you instructions for your audition in the virtual lobby<br />
            ***you can watch a set up best practices video here -<a href="https://heyjoe.io/actor-set-up/" target="_blank">https://heyjoe.io/actor-set-up/</a>
            <br />
            ***you can find troubleshooting tips here -<a href="https://heyjoe.io/troubleshooting/" target="_blank">https://heyjoe.io/troubleshooting/</a>
            <br />
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={selectedPostingPage && !selectedPostingPage.name}
            className="btn btn-primary"
            onClick={() => {
              handleCopyText('#talent-email-text')
              setEmailCheckinLink(null)
            }}
          >
            Copy
          </button>
        </Modal.Footer>
      </Modal>
      
      <SendClientEmailModal
        show={!!emailProject}
        onHide={() => {
          setEmailProject(null)
          setEmailSessionLink(null)
          setEmailSessionParams(null)
        }}
      />
      <Footer/>
    </div>
  )
}

export default StudioList
