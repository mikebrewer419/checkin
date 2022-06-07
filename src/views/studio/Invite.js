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
} from 'react-bootstrap'
import moment from 'moment'
import {
  apiGetRequestInfo,
  apiUpdateRequest,
} from '../../services'
import Error500 from '../Errors/500'

export default () => {
  const {id} = useParams()
  const [info, setInfo] = useState(undefined)
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
  const onRespBtnClick = (response) => {
    apiUpdateRequest(id, {response}).then(res=>{
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
      {!!info && !info.request.response && (
        <div className="d-flex justify-content-end my-3">
          <Button
            type="button"
            variant="danger"
            className="resp-btn"
            onClick={()=>{onRespBtnClick('yes')}}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant="light"
            className="resp-btn mx-3"
            onClick={()=>{onRespBtnClick('no')}}
          >
            No
          </Button>
          <Button
            type="button"
            variant="light"
            className="resp-btn"
            onClick={()=>{onRespBtnClick('maybe')}}
          >
            Second Hold
          </Button>
        </div>
      )}
      
      {!!info && (
        <>
          <h3 className="text-center">Request Summary</h3>
          
          <Row className="my-3">
            <Col>
              <h5 className="text-center">Project</h5>
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
            </Col>
            <Col>
              <h5 className="text-center">Session</h5>
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
            </Col>
            <Col>
              <h5 className="text-center">Request</h5>
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
            </Col>
          </Row>
        </>
      )}
      
      <Row>
        <Col>
          <div style={{background: 'gray', height: '200px'}}>
            message panel
          </div>
        </Col>
      </Row>
    </Container>  
  )
}