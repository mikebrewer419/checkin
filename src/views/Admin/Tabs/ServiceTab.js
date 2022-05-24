import React, {
  useState,
  useEffect,
} from 'react'

import {
  Form,
  Button
} from 'react-bootstrap'
import { FaCheck } from 'react-icons/fa';

import {
  getServices,
  updateAutoScalingGroup
} from '../../../services'

const AsgTr = ({asg}) => {
  const [desiredCapacity, setDesiredCapacity] = useState(asg.DesiredCapacity)
  const [previousCapacity, setPreviousCapacity] = useState(asg.DesiredCapacity)

  const onUpdateClick = () => {
    updateAutoScalingGroup({
      asg: [{
        'AutoScalingGroupName': asg.AutoScalingGroupName,
        'DesiredCapacity': desiredCapacity
    }]
    }).then(res=>{
      console.log(res)
      setPreviousCapacity(desiredCapacity)
    }).catch(err=>{
      console.log(err)
    })
  }
  return (
    <tr>
      <td className="p-2">
        {asg.AutoScalingGroupName}
      </td>
      <td className="p-2">
        <Form.Control
          value={desiredCapacity}
          type="number"
          onChange={(e)=>{
            setDesiredCapacity(e.target.value)
          }}
        />
      </td>
      <td className="p-2">
        {asg.Instances.length}
      </td>
      <td>
        {previousCapacity != desiredCapacity && (
          <Button onClick={onUpdateClick}>
            <FaCheck className="mr-2" />
            Update
          </Button>
        )}
      </td>
    </tr>
  )
}
const ServiceTab = () => {
  const [services, setServices] = useState(null)
  

  useEffect(() => {
    getServices().then(res=>{
      setServices(res)
    })
  }, [])
  
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <h2>Auto Scaling Groups</h2>
      </div>
      {services && services.AutoScalingGroups ? (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Desired Capacity</th>
              <th># of Instances</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.AutoScalingGroups.map((it, i) => (
              <AsgTr
                key={i}
                asg = {it}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="text-center py-5">Loading...</h4>
      )}
    </div>
  )
}

export default ServiceTab