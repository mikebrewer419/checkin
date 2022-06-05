import React, {
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
} from 'react-bootstrap'

import { set as setRequests } from '../../../store/freelancerRequests'
import {listRequests} from '../../../services'

import UserImg from '../../../assets/callin.png'

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
    <Accordion className="list-group hover-highlight">
      {freelancerRequests.map(it=>(
        <div key={it._id}>
          <Accordion.Toggle
            as="div"
            eventKey={it._id}
          >
            <Container fluid>
              <Row className="align-items-center">
                <Col md={2}>
                  <Image
                    src={UserImg}
                    width="60"
                  />
                </Col>
                <Col md={3}>
                  <h5 className="my-2">
                    {it.requested_person.first_name} {it.requested_person.last_name}
                  </h5>
                </Col>
                <Col md={2}>
                  <h5 className="my-2">
                    {it.requested_person.freelancer_profile && it.requested_person.freelancer_profile.timezone}
                  </h5>
                </Col>
                <Col md={5}>
                  <h5 className="my-2">
                    {it.requested_person.freelancer_profile && it.requested_person.freelancer_profile.will_work_as.join(', ')}
                  </h5>
                </Col>
              </Row>
            </Container>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey={it._id}>
            <div className="p-4">
              <div className="d-flex justify-content-end mb-2">
                <Button
                  variant="danger"
                  className="px-4"
                >
                  Book
                </Button>
              </div>
              <div style={{height: '180px', background: 'gray'}}></div>
            </div>
              
          </Accordion.Collapse>
        </div>
      ))}
        
    </Accordion>
  )
}