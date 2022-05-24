import React, {
  useState,
  useRef
} from 'react'

import {
  Form,
  Container,
  Row,
  Col,
  Modal,
  Button
} from 'react-bootstrap'

import moment from 'moment'
import { Editor } from '@tinymce/tinymce-react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'

import {
  searchUsers,
  sendClientEmail
}from '../../services'

import {
  USER_TYPES,
  TINYMCE_KEY
} from '../../constants'
import {} from '../../utils'

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
  onHide,
  studio,
  emailSessionParams,
  emailSessionLink
}) => {
  const [toAdditional, setToAdditional] = useState([])
  const [ccAdditional, setCcAdditional] = useState([])
  const [content, setContent] = useState('')
  const editorRef = useRef(null)
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query) => {
    setIsLoading(true);
    const sessionUsers = await searchUsers(query);
    setOptions(sessionUsers);
    setIsLoading(false);
      
  };

  const onSubmit= (e)=>{
    e.preventDefault()
    const data = {
      from: studio && studio.casting_directors.length > 0 ? studio.casting_directors[0].email : 'hello@heyjoe.io',
      to: [],
      cc: ['hello@heyjoe.io'],
      content: editorRef.currrent.getContent(),
      title: `${studio && studio.name} Session Link ${moment(new Date(emailSessionParams.start_time)).format('MM/DD/YYYY')}`
    }
    if (!!emailSessionParams && emailSessionParams.managers.length > 0)
    data.to = [...data.to, ...emailSessionParams.managers]
    if (!!emailSessionParams && emailSessionParams.lobbyManager.length > 0)
    data.to = [...data.to, ...emailSessionParams.lobbyManager]
    data.to = [...data.to, ...toAdditional.map(it=>it.email)]
    data.cc = [...data.cc, ...ccAdditional.map(it=>it.email)]
    
    sendClientEmail(data).then(res=>{
      res.json().then(t=>{
        onHide()
      })
    })
    
  }
  if (!show) return null

  const initialEmail = `
    <div id="client-email-text">
      <p className="mb-0">DATE: <strong>${ formatDate(emailSessionParams.start_time) || 'TBD' }</strong></p>
      <p className="mb-0">TIME: <strong>${ formatHour(emailSessionParams.start_time) || 'TBD' }</strong></p>
      <p className="mb-0">SESSION RUNNER: <strong>${ emailSessionParams.managers.map(m => m.email).join(',') || 'TBD' }</strong></p>
      <p className="mb-0">LOBBY: <strong>${ emailSessionParams.lobbyManager.map(m => m.email).join(',') || 'TBD' }</strong></p>
      <p className="mb-0">SUPPORT: <strong>${ emailSessionParams.support ? emailSessionParams.support.email : 'TBD' }</strong></p>
      <br />
      <p>
        Here is the <b>${studio.name}</b> Session Link:<br/>
        <a href=${emailSessionLink}>${emailSessionLink}</a>
      </p>
      <p>
        <b>
          <i>
            Note: Please use Google Chrome or Brave Browser. You can either click “Create Account” on the website or choose "Login with Google." For helpful tips on using the site&nbsp;
            <a href="https://heyjoe.io/hey-joe-log-on-instructions/" >
              click here. 
            </a>
            <br />
            Tech support: 424.888.4735 or&nbsp;
            <a href="mailto:hello@heyjoe.io">
              hello@heyjoe.io
            </a>
          </i>
        </b>
      </p>
    </div>`
  
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
        <Form onSubmit={onSubmit}>
          <Modal.Body>
            <Container>
              <Row>
                <Col md={6}>
                  <fieldset className="border rounded-lg px-3">
                    <legend className="d-inline-block w-auto px-2">To</legend>
                    <Form.Group>
                      <Form.Label>Session Manager</Form.Label>
                      {emailSessionParams && emailSessionParams.managers.length === 0 && (
                        <p className="px-2">-</p>
                      )}
                      {emailSessionParams && emailSessionParams.managers.map((it,i)=>(
                        <p key={i}>{it.email}</p>
                      ))}
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Lobby Manager</Form.Label>
                      {emailSessionParams && emailSessionParams.lobbyManager.length === 0 && (
                        <p className="px-2">-</p>
                      )}
                      {emailSessionParams && emailSessionParams.lobbyManager.map((it, i)=>(
                        <p key={i}>{it.email}</p>
                      ))}
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Additional Emails</Form.Label>
                      <AsyncTypeahead
                        id="to-additional-emails"
                        multiple
                        selected={toAdditional}
                        isLoading={isLoading}
                        onSearch={handleSearch}
                        labelKey="email"
                        minLength={2}
                        placeholder="Search for a additional emails..."
                        options={options}
                        onChange={value=>{setToAdditional(value)}}
                      />
                    </Form.Group>
                  </fieldset>
                </Col>
                <Col md={6}>
                  <fieldset className="border rounded-lg px-3 mb-2">
                    <legend className="d-inline-block w-auto px-2">From</legend>
                    <Form.Group>
                      {studio && studio.casting_directors.length === 0 && (
                        <p className="px-2">hello@heyjoe.io</p>
                      )}
                      {studio && studio.casting_directors.map((it, i)=>(
                        <p key={i}>{it.email}</p>
                      ))}
                    </Form.Group>
                  </fieldset>
                  <fieldset className="border rounded-lg px-3">
                    <legend className="d-inline-block w-auto px-2">CC</legend>
                    <p>hello@heyjoe.io</p>
                    <Form.Group>
                      <Form.Label>Additional Emails</Form.Label>
                      <AsyncTypeahead
                        id="cc-additional-emails"
                        className="mb-3"
                        multiple
                        selected={ccAdditional}
                        isLoading={isLoading}
                        onSearch={handleSearch}
                        labelKey="email"
                        minLength={2}
                        placeholder="Search for a additional emails..."
                        options={options}
                        onChange={value=>{setCcAdditional(value)}}
                      />
                    </Form.Group>
                  </fieldset>
                </Col>
              </Row>
              <Form.Group className="mt-3">
                <Form.Label>
                  Email
                </Form.Label>
                <Editor
                  apiKey={TINYMCE_KEY}
                  onInit={(evt, editor) => editorRef.current = editor}
                  initialValue={initialEmail}
                  init={{
                    height: '250px',
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
                />
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
    </Modal>
  )
}

export default SendClientEmailModal