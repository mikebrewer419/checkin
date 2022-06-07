import React, {
  useState,
  useRef,
} from 'react'

import {
  Modal,
  Button
} from 'react-bootstrap'

import {
  FaTimes
} from 'react-icons/fa'
import { Editor } from '@tinymce/tinymce-react'

import {
  sendClientEmail
}from '../../services'

import {
  TINYMCE_KEY
} from '../../constants'
import {} from '../../utils'

export default ({
  show,
  onHide,
  emailCheckinLink
}) => {
 
  const [emails, setEmails] = useState([])
  const editorRef = useRef(null)
  const emailsRef = useRef(null)
  const cursorRef = useRef(null)
  
  const removeEmail = (i) => {
    const temp = [...emails]
    temp.splice(i, 1)
    setEmails(temp)
  }
  const addEmail = (e) => {
    e.preventDefault()
    setEmails([...emails, e.target.email.value])
    e.target.reset()
    e.target.email.size = '1'
  }

  const onLoadBtnClick = (e) => {
    if (e.target.files.length > 0) {
      e.target.files[0].text().then(res=>{
        const rows = res.split('\n').map(it=>it.trim()).filter(it=>/^\S+@\S+\.\S+$/.test(it))
        setEmails(rows)
      })
    }
    
  }

  const onEmailTempKeyDown = (e) => {
    if ( e.key == ' ' || e.key == ',') {
      e.preventDefault()
      e.target.form.requestSubmit()
    }
  }
  
  const onSendBtnClick= (e)=>{
    e.preventDefault()
    const data = {
      to: emails,
      content: editorRef.current.getContent(),
      title: `Talent Email`
    }
    
    console.log('data: ', data);
    
    sendClientEmail(data).then(res=>{
      res.json().then(t=>{
        onHide()
      })
    })
    
  }

  if (!show) return null

  const initialEmail = `
    <p>You can audition from your phone or computer. Please choose the device that you believe has the best camera and internet connection (a newer smartphone usually works best).</p>
    <p><strong>AUDITION FROM PHONE:</strong><br />
    1. Download and open the Hey Joe app<br />
    iOS: https://apple.co/3grIxwR<br />
    Android: https://bit.ly/2MLDLwL<br />
    2. 15 minutes before your call time, click the link below to check in to the session. Your device will ask if you want to open the link in the Hey Joe app, please click "OK" or "Open":<br />
    <a rel="nofollow noreferrer noopener" target="_blank" href=${emailCheckinLink}>${emailCheckinLink}</a>
    <br />
    3. Once you are checked in, please click the "Join Virtual Lobby" button. The casting team will give you instructions for your audition in the virtual lobby<br />
    <strong>AUDITION FROM COMPUTER:</strong><br />
    1. Set up your computer and open Google Chrome (you must use Chrome for best results)<br />
    2. 15 minutes before your call time, click the link below to check in to the session:<br />
    <a rel="nofollow noreferrer noopener" target="_blank" href=${emailCheckinLink}>${emailCheckinLink}</a>
    <br />
    3. Once you are checked in, please click the "Join Virtual Lobby" button. The casting team will give you instructions for your audition in the virtual lobby<br />
    ***you can watch a set up best practices video here -<a href="https://heyjoe.io/actor-set-up/" target="_blank">https://heyjoe.io/actor-set-up/</a>
    <br />
    ***you can find troubleshooting tips here -<a href="https://heyjoe.io/troubleshooting/" target="_blank">https://heyjoe.io/troubleshooting/</a>
    <br />
    </p>`
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size='lg'
      className="send-talent-email-modal"
    >
      <Modal.Header closeButton>
        <div>
          <h4 className="mb-0 mr-3">Send Talent Email</h4>
          <div className="ml-1">from hello@heyjoe.io</div>
        </div>
      </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-end mb-2">
            <label className="mb-0">Recipients</label>
            <div className="position-relative">
              <Button
                variant="danger"
                block
                size='sm'
              >
                Load from CSV
              </Button>
              <input
                type="file"
                className="position-absolute w-100 h-100 top-0 transparent"
                onChange={onLoadBtnClick}
                accept=".csv"
              />
            </div>
          </div>
          
          <fieldset
            ref={emailsRef}
            className="border rounded p-2 pt-0 w-100  overflow-auto mb-4"
            onClick={()=>{cursorRef.current.focus()}}
          >
            { emails.map((it, i) => (
              <label
                key={i}
                className="bg-lightgray mx-2 my-1 px-2 py-1 rounded"
              >
                {it}
                <FaTimes
                  className="ml-2"
                  onClick={()=>{removeEmail(i)}}
                />
              </label>
            ))}
            <form
              onSubmit={addEmail}
              className="d-inline"
            >
              <input
                type="email"
                required
                name="email"
                className="input-cursor"
                ref={cursorRef}
                onChange={(e)=>{e.target.size = e.target.value.length + 1}}
                onKeyDown={onEmailTempKeyDown}
              />
            </form>
          </fieldset>
          <label>Email</label>
          <Editor
            apiKey={TINYMCE_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={initialEmail}
            init={{
              height: '300px',
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            variant="primary"
            className="mx-3 px-5"
            onClick={onSendBtnClick}
          >
            Send
          </Button>
        </Modal.Footer>
        
    </Modal>
  )
}
