import React, {
  useState,
  useEffect,
} from 'react'
import clsx from 'classnames'

import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal
} from 'react-bootstrap'
import { FaCheck } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';

import {
  getServices,
  updateAutoScalingGroup
} from '../../../services'

import {toggleLoadingState, getUserText} from '../../../utils'

const ServiceTab = () => {
  const [autoScalingGroups, setAutoScalingGroups] = useState(null)
  const [lastUpdateInfo, setlastUpdateInfo] = useState({})
  const [asgChangeState, setAsgChangeState] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadServices = () => {
    setLoading(true)
    getServices().then(res=>{
      setAutoScalingGroups(res.AutoScalingGroups)
      const data = res.AutoScalingGroups.map(it=>{
        return {
          name: it.AutoScalingGroupName,
          previous: it.DesiredCapacity,
          current: it.DesiredCapacity 
        }
      })
      setAsgChangeState(data)
      setlastUpdateInfo({
        by: getUserText(res.asg_updated_by),
        at: res.asg_updated_at,
      })
      setLoading(false)
    })
  }
  useEffect(() => {
    loadServices()
  }, [])
  
  const onDcChanged = (i, value) =>{
    const temp = [...asgChangeState]
    temp[i].current = value
    setAsgChangeState(temp)
  }
  const onUpdateConfirmBtnClick = () => {
    toggleLoadingState(true)
    const data = {
      asg: asgChangeState.filter(it=>it.current != it.previous)
        .map(it=>{
          return {
            AutoScalingGroupName: it.name,
            DesiredCapacity: it.current
          }
        })
    }
    setShowConfirmModal(false)
    updateAutoScalingGroup(data).then(res=>{
      toggleLoadingState(false)
      setAsgChangeState(null)
      setAutoScalingGroups(null)
      loadServices()
    }).catch(err=>{
      toggleLoadingState(false)
      alert('Request was not handled successfully')
    })

  }
  return (
    <Container fluid>
      <div className='d-flex'>
        <h2>Auto Scaling Groups</h2>
        <label title='Refresh' className='ml-3 mt-2 cursor-pointer h5' onClick={loadServices}>
          <MdRefresh className={clsx({
            'spinning': loading
          })} />
        </label>
      </div>
      {!!autoScalingGroups && !!asgChangeState ? (
        <>
          <Row>
            <Col lg={6}>
              <Table borderless>
                <thead>
                  <tr>
                    <th></th>
                    <th className="p-2">Desired Capacity</th>
                    <th className="p-2"># of Instances</th>
                  </tr>
                </thead>
                <tbody>
                  {autoScalingGroups.map((asg, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        {asg.AutoScalingGroupName}
                      </td>
                      <td className="p-2">
                        <Form.Control 
                          type="number"
                          value={asgChangeState[i].current}
                          onChange={(e)=>{onDcChanged(i, e.target.value)}}
                          className="form-control-sm"
                        />
                      </td>
                      <td className="p-2">
                        <span className='mr-3 h5'>{asg.Instances.length}</span>
                        {asg.Instances.map(inst => {
                          return `${inst.LifecycleState}`
                        }).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
            </Col>
          </Row>
          <div className="d-flex justify-content-between w-50">
            <div>
              Updated by <strong>{lastUpdateInfo.by}</strong> at <strong>{lastUpdateInfo.at}</strong>
            </div>
            <Button
              variant="danger"
              disabled={!!asgChangeState && asgChangeState.findIndex(it=>it.previous != it.current) == -1}
              onClick = {()=>{setShowConfirmModal(true)}}
            >
              <FaCheck className="mr-2" />
              Update
            </Button>
        </div>
        </>
      ) : (
        <h4 className="text-center py-5">Loading...</h4>
      )}
      <Modal
        show={showConfirmModal}
        onHide={()=>{setShowConfirmModal(false)}}
      >
        <Modal.Header closeButton>
          <h4 className="my-0">Confirmation</h4>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to update Auto Scaling group capacity. Please make sure you are doing the right thing.</p>
          <p>You are updating following ASG settings</p>
          <Table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>New Capacity</th>
                <th>Original Capacity</th>
              </tr>
            </thead>
            <tbody>
              {!!asgChangeState && asgChangeState.map((it,i)=>(
                <tr key={i}>
                  <td>{it.name}</td>
                  <td>{it.current}</td>
                  <td>{it.previous}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            className="px-4 mr-2"
            onClick={onUpdateConfirmBtnClick}
          >
            OK
          </Button>
          <Button
            variant="default"
            onClick={()=>{setShowConfirmModal(false)}}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ServiceTab