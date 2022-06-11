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
import { FaCheck, FaArrowLeft } from 'react-icons/fa'
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
  const onConfirmBtnClick = async () => {
    await apiUpdateRequest(id, {
      response: newResp
    })
    await loadRequest()
    setNewResp(null)
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
          <div className="d-flex my-3">
            <div className='d-flex align-items-center mr-auto'>
              <FaArrowLeft
                className='mr-3 cursor-pointer'
                onClick={() => {
                  window.history.back()
                }}
              />
              <span className='h4'>
                {info.studio.name} {info.session.name} Request
              </span>
            </div>
            <Button
              className="px-3"
              variant={info.request.response === 'yes' ? 'danger':"light"}
              size="sm"
              onClick={()=>{setNewResp('yes')}}
            >
              {info.request.response === 'yes' && <FaCheck className="mr-1" /> }
              Yes
            </Button>  
            <Button
              className="px-3 mx-3"
              variant={info.request.response === 'no' ? 'danger':"light"}
              size="sm"
              onClick={()=>{setNewResp('no')}}
            >
              {info.request.response === 'no' && <FaCheck className="mr-1" />}
              No
            </Button>
            <Button
              className="px-3 position-relative"
              variant={info.request.response === 'maybe' ? 'danger':"light"}
              size="sm"
              onClick={()=>{setNewResp('maybe')}}
            >
              {info.request.response === 'maybe' && <FaCheck className="mr-1" />}
              Second Hold
            </Button>
          </div>
          <div className='d-flex flex-column'>
            <div className='d-flex mr-3'>
              <label className='mr-4'>Casting Director</label>
              {info.studio.casting_directors.map(c => {
                return `${c.first_name} ${c.last_name} (${c.email})`
              })}
              {info.studio.casting_directors.length === 0 && '-'}
            </div>
            <div className='d-flex'>
              <label className='mr-4'>Session Dates</label>
              {info.session.dates.map(date => {
                return (
                  <div key={date.start_time}>
                    <span className='mr-2'>{moment(new Date(date.start_time)).format('MM/DD')}</span>
                    <span className='mr-2'>{date.book_status}</span>
                    <span className='mr-2'>{date.start_time_type}</span>
                  </div>
                )
              })}
            </div>
            <div>
              <label className='mr-4'>Requestor</label>
              <span>
                {info.request.request_by.first_name} {info.request.request_by.last_name}&nbsp;
                ({info.request.request_by.email})
              </span>
            </div>
            <div className='mt-3'>
              <blockquote dangerouslySetInnerHTML={{__html: info.session.description}} />
            </div>
          </div>
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