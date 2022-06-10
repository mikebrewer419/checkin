import React, {
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
} from 'react-bootstrap'
import { FaCheck } from 'react-icons/fa'
import moment from 'moment'
import {
  apiGetRequestInfo,
  apiUpdateRequest,
} from '../../services'
import Error500 from '../Errors/500'

export default () => {
  const {id} = useParams()
  const [info, setInfo] = useState(undefined)
  const [newResp, setNewResp] = useState(null)
  const [showConfirmModal, setShowConfirmModl] = useState(false)

  const loadRequest = useCallback(()=>{
    apiGetRequestInfo(id).then(res=>{
      setInfo(res)
    }).catch(err=>{
      setInfo(null)
    })
  }, [])
  useEffect(()=>{
    loadRequest()
  }, [])
  const onConfirmBtnClick = () => {
    setNewResp(null)
    apiUpdateRequest(id, {
      response: newResp
    }).then(res=>{
      console.log(res)
      loadRequest()
    }).catch(err=>{
      console.log(err)
    })
  }
  if (info === null) {
    return <Error500 />
  }
  return (
    <Container
      fluid
      className="my-5 freelancer-request-respond-page"
    >
      {!!info && (
        <>
          <div className="d-flex justify-content-end my-3">
            
              <Button
                type="button"
                variant="danger"
                className="resp-btn"
                disabled={info.request.response === 'yes'}
                onClick={()=>{setNewResp('yes')}}
              >
                {info.request.response === 'yes' && <FaCheck className="mr-1" /> }
                Yes
              </Button>  
            <Button
              type="button"
              variant="warning"
              className="resp-btn mx-3"
              disabled={info.request.response === 'no'}
              onClick={()=>{setNewResp('no')}}
            >
              {info.request.response === 'no' && <FaCheck className="mr-1" />}
              No
            </Button>
            <Button
              type="button"
              variant="light"
              className="resp-btn position-relative"
              disabled={info.request.response === 'maybe'}
              onClick={()=>{setNewResp('maybe')}}
            >
              {info.request.response === 'maybe' && <FaCheck className="mr-1" />}
              Second Hold
            </Button>
          </div>
          <h3 className="text-center">Request Summary</h3>
          <Row className="my-3">
            <Col>
              <Card className="h-100">
                <Card.Header>
                  <h5 className="text-center">Project</h5>
                </Card.Header>
                <Card.Body>
                  <table className="w-100 text-10 info-table">
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>:</td>
                        <td>{info.studio.name}</td>
                      </tr>
                      <tr>
                        <td>Casting Directors</td>
                        <td>:</td>
                        <td>
                          {info.studio.casting_directors.map(it=>(
                            <div>{it.first_name} {it.last_name}</div>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td>Project Type</td>
                        <td>:</td>
                        <td>{info.studio.project_type}</td>
                      </tr>
                      <tr>
                        <td>Created By</td>
                        <td>:</td>
                        <td>{info.studio.created_by.first_name} {info.studio.created_by.last_name}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="h-100">
                <Card.Header>
                  <h5 className="text-center">Session</h5>
                </Card.Header>
                <Card.Body>
                  <table className="w-100 text-10 info-table">
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>:</td>
                        <td>{info.session.name}</td>
                      </tr>
                      <tr>
                        <td>Created At</td>
                        <td>:</td>
                        <td>
                          {moment(new Date(info.session.created_at)).format('MM/DD/YYYY')}
                        </td>
                      </tr>
                      <tr>
                        <td>Dates</td>
                        <td>:</td>
                        <td>
                          {info.session.dates.map(it=>(
                            <div>
                              {moment(it.start_time).format('MM/DD/YYYY T HH:mm:ss')}
                            </div>
                          ))}
                        </td>
                      </tr>
                      
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card className="h-100">
                <Card.Header>
                  <h5 className="text-center">Request</h5>
                </Card.Header>
                <Card.Body>
                  <table className="w-100 text-10 info-table">
                    <tbody>
                      <tr>
                        <td>Requested By</td>
                        <td>:</td>
                        <td>{info.request.request_by.first_name} {info.request.request_by.last_name}</td>
                      </tr>
                      <tr>
                        <td>Posted At</td>
                        <td>:</td>
                        <td>{moment(info.request.date).format('MM/DD/YYYY T HH:mm:ss')}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Modal
        show={!!newResp}
        onHide={()=>{setNewResp(null)}}
      >
        <Modal.Header>
          Confirm
        </Modal.Header>
        <Modal.Body>
          <h5>Are you sure you want to change the response</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            className="btn-w-md"
            onClick={onConfirmBtnClick}
          >
            Yes
          </Button>
          <Button
            variant="light"
            className="btn-w-md"
            onClick={() => {setNewResp(null)}}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>  
  )
}