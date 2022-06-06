import React, {
  useState,
  useEffect,
  useCallback,
} from 'react'

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
  FormControl
} from 'react-bootstrap'

import { set as setProfiles } from '../../../store/freelancerProfiles'
import {add as addRequest} from '../../../store/freelancerRequests'
import Pagination from '../../../components/Pagination'

import {
  createRequest,
  listProfiles
  
} from '../../../services'

import UserImg from '../../../assets/callin.png'

const PAGE_SIZE = 10

export default ({session}) => {
  
  const [page, setPage] = useState(0)
  const [willWorkAs, setWillWorkAs] = useState('')
  const [name, setName] = useState('')

  const  freelancerProfiles= useSelector(state=>state.freelancerProfiles)
  const dispatch = useDispatch()
  
  const loadUninvited = useCallback(()=>{
    listProfiles({
      exclude_session: session._id,
      name: name,
      will_work_as: willWorkAs
    }).then(res=>{
      dispatch(setProfiles(res))
    }).catch(err=>{})
  }, [page, name, willWorkAs])
  
  
  useEffect(()=>{
    loadUninvited()
  }, [loadUninvited])

  const onInviteBtnClick = (e, freelancer_id) => {
    e.stopPropagation()
    createRequest(session._id, freelancer_id).then(res=>{
      loadUninvited()
      dispatch(addRequest(res))
    }).catch(err=>{
    })
  }

  return (
    <div>
      <div className="invite-tab-content">
        <Container className="my-2">
          <Row>
            <Col md={3}>
              <FormControl
                placeholder="Search by Name"
                value={name}
                onChange={(e)=>{setName(e.target.value)}}
              />
            </Col>
            <Col md={3}>
              <FormControl
                placeholder="Search by Will Work As"
                value={willWorkAs}
                onChange={(e)=>{setWillWorkAs(e.target.value)}}
              />
            </Col>
          </Row>
        </Container>
        <Accordion className="list-group hover-highlight">
          {freelancerProfiles.profiles.map(it=>(
            <div key={it._id}>
              <Accordion.Toggle
                as="div"
                eventKey={it._id}
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
                        {it.user.first_name} {it.user.last_name}
                      </h5>
                    </Col>
                    <Col md={2}>
                      <h5 className="my-2">
                        {it.timezone}
                      </h5>
                    </Col>
                    <Col md={4}>
                      <h5 className="my-2">
                        {it.will_work_as.join(', ')}
                      </h5>
                    </Col>
                    <Col
                      md={2}
                      className="d-flex justify-content-end"
                    >
                      <Button
                        variant="danger"
                        onClick={(e)=> {onInviteBtnClick(e, it.user._id)}}
                      >
                        Invite
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={it._id}>
                <div className="px-4 py-2">
                  <label>Experience</label>
                  <p>{it.experience}</p>
                  <label>Avability Notes</label>
                  <p>{it.avability_notes}</p>
                </div>
                  
              </Accordion.Collapse>
            </div>
          ))}
            
        </Accordion>
      </div>
      <Pagination
        pageCount={Math.ceil(+freelancerProfiles.total / PAGE_SIZE)}
        page={page}
        setPage={(val)=>{setPage(val)}}
      />
    </div>
  )
}