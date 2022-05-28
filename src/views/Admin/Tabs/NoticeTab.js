import React, {
  useState,
  useEffect,
  useRef
} from "react";

import {
  Button,
  Container,
  Row,
  Col,
} from 'react-bootstrap'

import { Editor } from '@tinymce/tinymce-react'

import { TINYMCE_KEY } from '../../../constants'

import {
  getNotification,
  updateNotification,
} from '../../../services'

const NoticeTab = () => {
  const [showNotification, setShowNotification] = useState('client_notice')
  const [notification, setNotification] = useState({})
  const editorRef = useRef(null)
  useEffect(async ()=>{
    let n = await getNotification()
    n = n || {}
    setNotification(n)
  }, [])

  return (
    <Container fluid>
      <Row>
        <Col md={2}>
          <Button
            variant={showNotification === 'client_notice' ?'danger' : 'default'}
            block
            className="text-left"
            onClick={() => {
              setShowNotification('client_notice')
            }}
          >
            Client Notice
          </Button>
      
          <Button
            variant={showNotification === 'casting_director_notice' ?'danger' : 'default'}
            block
            className="text-left"
            onClick={() => {
              setShowNotification('casting_director_notice')
            }}
          >
            Casting Director Notice
          </Button>
        
          <Button
            variant={showNotification === 'session_manager_notice' ?'danger' : 'default'}
            block
            className="text-left"
            onClick={() => {
              setShowNotification('session_manager_notice')
            }}
          >
            Session Manager Notice
          </Button>
        
          <Button
            variant={showNotification === 'notification' ?'danger' : 'default'}
            block
            className="text-left"
            onClick={() => {
              setShowNotification('notification')
            }}
          >
            Global Notification
          </Button>
        </Col>
        <Col md={10}>
          <Editor
            key={showNotification}
            apiKey={TINYMCE_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            init={{
              height: '65vh',
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
            initialValue={notification[showNotification]}
          />
          <div className="my-2">
            <Button
              className="mr-3"
              onClick={async () => {
                const n = editorRef.current.getContent()
                updateNotification({ [showNotification]: n })
                setNotification({ ...notification, [showNotification]: n })
              }}
            >
              Save
            </Button>
            <Button
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default NoticeTab