import React, {
  useState,
  useEffect,
} from 'react'

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

import {
  getServices,
  updateAutoScalingGroup
} from '../../../services'

import {toggleLoadingState} from '../../../utils'

const ServiceTab = () => {
  const [autoScalingGroups, setAutoScalingGroups] = useState(null)
  const [asgChangeState, setAsgChangeState] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const loadServices = () => {
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
      <h2>Auto Scaling Groups</h2>
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
                        />
                      </td>
                      <td className="p-2">
                        {asg.Instances.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
            </Col>
          </Row>
          <div className="d-flex justify-content-center">
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