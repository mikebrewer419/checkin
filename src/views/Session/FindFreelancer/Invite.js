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
} from 'react-bootstrap'

import { setUninvited } from '../../../store/freelancers'
import {add as addRequest} from '../../../store/freelancerRequests'
import Pagination from '../../../components/Pagination'

import {
  getUninvitedFreelancers,
  createRequest,
  listRequests,
  
} from '../../../services'

import UserImg from '../../../assets/callin.png'

const PAGE_SIZE = 10

export default ({session}) => {
  
  const [page, setPage] = useState(0)

  const  freelancers= useSelector(state=>state.freelancers)
  const dispatch = useDispatch()
  
  const loadUninvited = useCallback(()=>{
    getUninvitedFreelancers({
      session:session._id,
      skip: PAGE_SIZE * page,
      take: PAGE_SIZE
    }).then(res=>{
      dispatch(setUninvited(res))
    }).catch(error => {
    })
  }, [])
  
  
  useEffect(()=>{
    loadUninvited()
  }, [loadUninvited, page])

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
        <Accordion className="list-group hover-highlight">
          {freelancers.uninvited.profiles.map(it=>(
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
        pageCount={20}
        page={page}
        setPage={(val)=>{setPage(val)}}
      />
    </div>
  )
}