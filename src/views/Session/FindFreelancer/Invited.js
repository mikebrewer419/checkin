import React, {
  useState,
  useEffect,
  useCallback,
} from "react"

import {
  useSelector,
  useDispatch,
} from 'react-redux'

import {
  Accordion,
  Container,
  Row,
  Col,
  Image,
  Button,
  Modal,
  Form,
} from 'react-bootstrap'
import {
  FaThumbsUp,
  FaThumbsDown,
  FaMinus
} from 'react-icons/fa'
import { 
  set as setRequests,
  update,
  update as updateRequestStore,
} from '../../../store/freelancerRequests'
import {
  listRequests,
  apiBookFreelancer
} from '../../../services'

import UserImg from '../../../assets/callin.png'

const responses = ['yes', 'maybe', undefined, 'no']
const cpReq = (a, b) => {
  return responses.indexOf(a.response) - responses.indexOf(b.response)
}

const Request = ({request, session}) =>{
  const [showBookModal, setShowBookModal] = useState(false)
  const dispatch = useDispatch()
  
  const onBookSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    formData.append('status', 'book')
    formData.append('requested_person', request.requested_person._id)
    formData.append('session', session._id)
    apiBookFreelancer(request._id, formData).then(res=>{
      dispatch(updateRequestStore(res))
    })
    setShowBookModal(false)
  }
  const onRejectBtnClick = () =>{
    const formData = new FormData()
    formData.append('status', 'reject')
    apiBookFreelancer(request._id, formData).then(res=>{
     dispatch(updateRequestStore(res))
    })
  }
  
  return (
    <div>
      <Accordion.Toggle
        as="div"
        eventKey={request._id}
      >
        <Container fluid>
          <Row className="align-items-center">
            <Col md={1}>
              <Image
                src={UserImg}
                width="60"
              />
            </Col>
            <Col md={3}>
              <h5 className="my-2">
                {request.requested_person.first_name} {request.requested_person.last_name}
              </h5>
            </Col>
            <Col md={2}>
              <h5 className="my-2">
                {request.requested_person.freelancer_profile && request.requested_person.freelancer_profile.timezone}
              </h5>
            </Col>
            <Col md={5}>
              <h5 className="my-2">
                {request.requested_person.freelancer_profile && request.requested_person.freelancer_profile.will_work_as.join(', ')}
              </h5>
            </Col>
            <Col md={1}>
              {(()=>{
                if (request.response === 'yes') {
                  return <FaThumbsUp />
                } else if (request.response === 'no') {
                  return <FaThumbsDown />
                } else if (request.response === 'maybe') {
                  return <FaMinus />
                }
              })()}
            </Col>
          </Row>
        </Container>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={request._id}>
        <div className="p-4">
          {!request.status && (
            <div className="d-flex justify-content-end mb-2">
              <Button
                variant="light"
                className="px-4 mr-3"
                onClick={onRejectBtnClick}
              >
                Reject
              </Button>
              <Button
                variant="danger"
                className="px-4"
                onClick={() => {setShowBookModal(true)}}
              >
                Book
              </Button>
            </div>
          )
          
          }
          <div style={{height: '180px', background: 'gray'}}></div>
        </div>
          
      </Accordion.Collapse>
      <Modal
        show={showBookModal}
        onHide={()=>{setShowBookModal(false)}}
      >
        <Form
          className="d-flex flex-column h-100"
          onSubmit={onBookSubmit}
        >
          <Modal.Header>
            <div>
              <h5 className="my-0">Book Session Managers</h5>
              <div>{session.name}</div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Select Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
              >
                <option value="session_runner">Session Runner</option>
                <option value="lobby_manager">Lobby Manager</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                as="select"
                name="date"
              >
                {session.dates.map(it=> (
                  <option
                    key={it._id}
                    value={it._id}
                  >
                    {it.start_time}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="light"
              onClick={()=>{setShowBookModal(false)}}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
            >
              Book
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default ({session}) => {
  
  const freelancerRequests = useSelector(state=>state.freelancerRequests)
  const dispatch = useDispatch()

  const loadInvited = useCallback(() => {
    listRequests({session: session._id}).then(res => {
      dispatch(setRequests(res.requests))
    }).catch(err=>{
      console.log(err)
    })
  }, [])

  useEffect(() => {
    loadInvited()
  }, [loadInvited])

  return (
    <div className="my-2">
      <Accordion className="list-group hover-highlight">
        {[...freelancerRequests].sort(cpReq).map(it=>(
          <Request
            key={it._id}
            request={it}
            session={session}
          />
        ))}
      </Accordion>
      
    </div>
  )
}