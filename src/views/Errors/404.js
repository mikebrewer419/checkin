import React from 'react'
import {useHistory} from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Button  
} from 'react-bootstrap'
export default () => {
  const history = useHistory()
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-center my-5">Not Found</h1>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Button
            type="button"
            variant="danger"
            onClick={()=>{history.goBack()}}
          >
            Go Back
          </Button>  
        </Col>
      </Row>
    </Container>
  )
}