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
  FaMinus,
  FaQuestion,
  FaCheck,
  FaPlus,
  FaFrown,
  FaGrin
} from 'react-icons/fa'

import _ from 'lodash'

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
                {_.get(request, 'requested_person.freelancer_profile.timezone', '')}
              </h5>
            </Col>
            <Col md={5}>
              <h5 className="my-2">
                {_.get(request, 'requested_person.freelancer_profile.will_work_as',[]).join(', ')}
              </h5>
            </Col>
            <Col
              md={1}
              className="d-flex"
            >
              <div className="w-50">
                {(()=>{
                  if (request.response === 'yes') {
                    return (
                      <FaThumbsUp
                        size={20}
                        color="#fe0923"
                        title="Yes"
                      />
                    )
                  } else if (request.response === 'no') {
                    return (
                      <FaThumbsDown
                        size={20}
                        color="#fe0923"
                        title="No"
                      />
                    )
                  } else if (request.response === 'maybe') {
                    return (
                      <FaMinus
                        size={20}
                        color="#fe0923"
                        title="Maybe"
                      />
                    )
                  } else {
                    return (
                      <FaQuestion
                        size={20}
                        color="#fe0923"
                        title="Not Responded Yet"
                      />
                    )
                  }
                })()}
              </div>
              <div className="w-50">
                {(()=>{
                  if (request.status === 'book') {
                    return (
                      <FaGrin
                        size={20}
                        color="#fe0923"
                        title="Book"
                      />
                    )
                  } else if (request.status === 'reject') {
                    return (
                      <FaFrown
                        size={20}
                        color="#fe0923"
                        title="Reject"
                      />
                    )
                  } else {
                    return (
                      <FaQuestion
                        size={20}
                        color="#fe0923"
                        title="Not determined"
                      />
                    )
                  }
                })()}
              </div>
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
          )}
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
      <div className="d-flex justify-content-end my-3">
        <div className="mr-5">
          <h6 className="my-0 text-center">freelancer Reponse</h6>
          <div className="d-flex">
            <div className="mr-2 d-flex align-items-center"><FaThumbsUp color="#fe0923" />&nbsp;:&nbsp;<span>Yes</span></div>
            <div className="mr-2 d-flex align-items-center"><FaThumbsDown color="#fe0923" />&nbsp;:&nbsp;<span>No</span></div>
            <div className="mr-2 d-flex align-items-center"><FaMinus color="#fe0923" /> &nbsp;:&nbsp;<span>Maybe</span></div>
            <div className="mr-2 d-flex align-items-center"><FaQuestion color="#fe0923" />&nbsp;:&nbsp;<span>Not Responded Yet</span></div>
          </div>
        </div>
        <div>
          <h6 className="my-0 text-center">Book Status</h6>
          <div className="d-flex">
            <div className="mr-2 d-flex align-items-center"><FaGrin color="#fe0923" />&nbsp;:&nbsp;<span>Book</span></div>
            <div className="mr-2 d-flex align-items-center"><FaFrown color="#fe0923" /> &nbsp;:&nbsp;<span>Reject</span></div>
            <div className="mr-2 d-flex align-items-center"><FaQuestion color="#fe0923" />&nbsp;:&nbsp;<span>Not Determined Yet</span></div>
          </div>
        </div>
      </div>
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