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
  Table
} from 'react-bootstrap'
import { FaCheck } from 'react-icons/fa';

import {
  getServices,
  updateAutoScalingGroup
} from '../../../services'

import {toggleLoadingState} from '../../../utils'

const ServiceTab = () => {
  const [autoScalingGroups, setAutoScalingGroups] = useState(null)
  useEffect(() => {
    getServices().then(res=>{
      setAutoScalingGroups(res.AutoScalingGroups)
    })
  }, [])
  console.log(autoScalingGroups)
  const onDcChanged = (i, value) =>{
    const temp = [...autoScalingGroups]
    temp[i].DesiredCapacity = value
    setAutoScalingGroups(temp)
  }
  const onUpdateBtnClick = () => {
    toggleLoadingState(true)
    updateAutoScalingGroup({
      asg: autoScalingGroups
    }).then(res=>{
      console.log(res)
      toggleLoadingState(false)
    }).catch(err=>{
      console.log(err)
      toggleLoadingState(false)
    })
  }
  return (
    <Container fluid>
      <h2>Auto Scaling Groups</h2>
      {!!autoScalingGroups ? (
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
                          value={asg.DesiredCapacity}
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
              onClick = {onUpdateBtnClick}
            >
              <FaCheck className="mr-2" />
              Update
            </Button>
        </div>
        </>
      ) : (
        <h4 className="text-center py-5">Loading...</h4>
      )}

    </Container>
  )
}

export default ServiceTab