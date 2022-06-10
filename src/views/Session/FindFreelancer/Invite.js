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
  FormControl,
  Form
} from 'react-bootstrap'

import { set as setProfiles } from '../../../store/freelancerProfiles'
import {add as addRequest} from '../../../store/freelancerRequests'
import Pagination from '../../../components/Pagination'

import {
  createRequest,
  listProfiles,
  apiListFreelancers,
  
} from '../../../services'

import UserImg from '../../../assets/callin.png'
import { FaCheck } from 'react-icons/fa'

const PAGE_SIZE = 10

export default ({session}) => {
  
  const [page, setPage] = useState(0)
  const [willWorkAs, setWillWorkAs] = useState([false, false])
  const [name, setName] = useState('')

  const  freelancers= useSelector(state=>state.freelancerProfiles)
  const freelancerRequests = useSelector(state=>state.freelancerRequests)

  const dispatch = useDispatch()
  
  const loadUninvited = useCallback(()=>{
    const temp = []
    if (willWorkAs[0]) {
      temp.push('session_runner')
    }
    if (willWorkAs[1]) {
      temp.push('lobby_manager')
    }
    apiListFreelancers({
      name: name,
      will_work_as: temp
    }).then(res=>{
      dispatch(setProfiles(res))
    }).catch(err=>{
      console.log(err)
    })
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
        <Container
          className="my-2"
          fluid
        >
          <Row>
            <Col md={3}>
              <FormControl
                placeholder="Search by Name"
                value={name}
                onChange={(e)=>{setName(e.target.value)}}
              />
            </Col>
            <Col
              md={6}
              className="d-flex align-items-center text-10"
            >
              <Form.Label className="my-0 mr-3">Will Work As</Form.Label>
              <div>
                <Form.Check
                  label="Session Runner"
                  inline
                  onChange={(e)=>{setWillWorkAs([e.target.checked, willWorkAs[1]])}}
                  checked={willWorkAs[0]}
                />
                <Form.Check
                  label="Lobby Manager"
                  inline
                  onChange={(e)=>{setWillWorkAs([willWorkAs[0], e.target.checked])}}
                  checked={willWorkAs[1]}
                />
              </div>
              
            </Col>
          </Row>
        </Container>
        <Accordion className="list-group hover-highlight">
          {freelancers.profiles.map(it=>(
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
                        {it.first_name} {it.last_name}
                      </h5>
                    </Col>
                    <Col md={2}>
                      <h5 className="my-2">
                        {it.freelancer_profile.timezone}
                      </h5>
                    </Col>
                    <Col md={4}>
                      <h5 className="my-2 text-capitalize">
                        {it.freelancer_profile.will_work_as.map(it=>it.split('_').join(' ')).join(', ')}
                      </h5>
                    </Col>
                    <Col
                      md={2}
                      className="d-flex justify-content-center"
                    >
                      {freelancerRequests.findIndex(req=>req.requested_person._id === it._id) === -1
                        ? (
                          <Button
                            variant="danger"
                            onClick={(e)=> {onInviteBtnClick(e, it._id)}}
                          >
                            Invite
                          </Button>
                        ) : (
                          <FaCheck
                            color="#fe0923"
                          />
                        )
                      }
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
        pageCount={Math.ceil(+freelancers.total / PAGE_SIZE)}
        page={page}
        setPage={(val)=>{setPage(val)}}
      />
    </div>
  )
}